import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const admin = getSupabaseAdmin();
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase().slice(0, 100) : '';
    const emoji = typeof body.emoji === 'string' ? body.emoji.trim().slice(0, 10) : '🎮';
    const image_url = typeof body.image_url === 'string' ? body.image_url.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim().slice(0, 50) : 'Jeux';
    const sort_order = Number.isInteger(body.sort_order) ? body.sort_order : 0;
    const packages = Array.isArray(body.packages) ? body.packages : [];

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nom et identifiant (slug) obligatoires' }, { status: 400 });
    }

    const { data: game, error: gameError } = await admin
      .from('games')
      .insert([{ name, slug, emoji, image_url, category, sort_order }])
      .select()
      .single();

    if (gameError) {
      console.error('Game insert error:', gameError);
      return NextResponse.json({ error: 'Échec de la création du jeu' }, { status: 500 });
    }

    if (packages.length > 0) {
      const validPackages = packages
        .filter((pkg: any) => pkg && typeof pkg.label === 'string' && Number(pkg.price) >= 0)
        .map((pkg: any) => ({
          game_id: game.id,
          label: String(pkg.label).trim().slice(0, 100),
          price: Number(pkg.price),
        }));

      if (validPackages.length > 0) {
        const { error: pkgError } = await admin.from('game_packages').insert(validPackages);
        if (pkgError) {
          console.error('Package insert error:', pkgError);
        }
      }
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'CREATE_GAME',
      targetType: 'games',
      targetId: game.id,
      details: { name, slug, packageCount: packages.length },
    });

    return NextResponse.json({ success: true, game });
  } catch (err: unknown) {
    console.error('Unexpected game POST error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "L'ID du jeu est requis." }, { status: 400 });

    const admin = getSupabaseAdmin();
    
    // Fetch game name before deletion for audit log
    const { data: existingGame } = await admin.from('games').select('name').eq('id', id).single();

    // Delete packages first
    await admin.from('game_packages').delete().eq('game_id', id);
    const { error } = await admin.from('games').delete().eq('id', id);
    if (error) {
      console.error('Game delete error:', error);
      return NextResponse.json({ error: 'Échec de la suppression du jeu' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'DELETE_GAME',
      targetType: 'games',
      targetId: id,
      details: { name: existingGame?.name || id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Unexpected game DELETE error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: "L'ID du jeu est requis." }, { status: 400 });

    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase().slice(0, 100) : '';
    const emoji = typeof body.emoji === 'string' ? body.emoji.trim().slice(0, 10) : '🎮';
    const image_url = typeof body.image_url === 'string' ? body.image_url.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim().slice(0, 50) : 'Jeux';
    const sort_order = Number.isInteger(body.sort_order) ? body.sort_order : 0;
    const packages = Array.isArray(body.packages) ? body.packages : [];

    const admin = getSupabaseAdmin();

    const { error: gameError } = await admin
      .from('games')
      .update({ name, slug, emoji, image_url, category, sort_order })
      .eq('id', id);

    if (gameError) {
      console.error('Game update error:', gameError);
      return NextResponse.json({ error: 'Échec de la modification du jeu' }, { status: 500 });
    }

    // 1. Fetch existing packages with their UUIDs so we can preserve stable IDs
    const { data: existingPackages } = await admin
      .from('game_packages')
      .select('id, label, price')
      .eq('game_id', id);

    // 2. Validate incoming packages
    type PackageInput = { id?: string; label: string; price: number; active?: boolean; popular?: boolean };
    const incomingPackages: PackageInput[] = packages
      .filter((pkg: PackageInput) => pkg && typeof pkg.label === 'string' && Number(pkg.price) >= 0)
      .map((pkg: PackageInput) => ({
        id: typeof pkg.id === 'string' && pkg.id ? pkg.id : undefined,
        game_id: id,
        label: String(pkg.label).trim().slice(0, 100),
        price: Number(pkg.price),
        active: pkg.active !== false,
        popular: pkg.popular === true,
      }));

    // 3. Upsert packages that have an ID (preserves UUID → no cart breakage)
    const withId = incomingPackages.filter(p => p.id);
    const withoutId = incomingPackages.filter(p => !p.id);

    if (withId.length > 0) {
      const { error: upsertErr } = await admin
        .from('game_packages')
        .upsert(withId, { onConflict: 'id' });
      if (upsertErr) {
        console.error('Package upsert error:', upsertErr);
        return NextResponse.json({ error: 'Échec de la mise à jour des forfaits' }, { status: 500 });
      }
    }

    // 4. Insert new packages (no ID provided)
    if (withoutId.length > 0) {
      const { error: insertPkgError } = await admin
        .from('game_packages')
        .insert(withoutId);
      if (insertPkgError) {
        console.error('Package insert error:', insertPkgError);
        return NextResponse.json({ error: 'Échec de l\'insertion des nouveaux forfaits' }, { status: 500 });
      }
    }

    // 5. Delete packages removed by the admin (IDs present in DB but not in incoming list)
    const incomingIds = new Set(withId.map(p => p.id).filter(Boolean));
    const toDelete = (existingPackages || []).filter(ep => !incomingIds.has(ep.id)).map(ep => ep.id);
    if (toDelete.length > 0) {
      await admin.from('game_packages').delete().in('id', toDelete);
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'UPDATE_GAME',
      targetType: 'games',
      targetId: id,
      details: { name, slug, packageCount: incomingPackages.length },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Unexpected game PUT error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
