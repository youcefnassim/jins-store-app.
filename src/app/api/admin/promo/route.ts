import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data: promos, error } = await admin
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin promo GET error:', error);
      return NextResponse.json({ error: 'Impossible de charger les codes promo' }, { status: 500 });
    }
    return NextResponse.json({ promos: promos || [] });
  } catch (err: unknown) {
    console.error('Unexpected admin promo GET error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const code = typeof body.code === 'string' ? body.code.toUpperCase().trim() : '';
    const discount = parseInt(String(body.discount_percentage), 10);
    const maxUses = parseInt(String(body.max_uses), 10);

    if (!code || !/^[A-Z0-9_-]{2,30}$/.test(code)) {
      return NextResponse.json({ error: 'Code promo invalide (2 à 30 caractères alphanumériques)' }, { status: 400 });
    }
    if (isNaN(discount) || discount < 1 || discount > 100) {
      return NextResponse.json({ error: 'Pourcentage de réduction invalide (entre 1% et 100%)' }, { status: 400 });
    }
    if (isNaN(maxUses) || maxUses < 1) {
      return NextResponse.json({ error: "Nombre d'utilisations maximum invalide" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin.from('promo_codes').insert([
      {
        code,
        discount_percentage: discount,
        max_uses: maxUses,
        current_uses: 0,
        active: true,
      },
    ]).select().single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ce code promo existe déjà' }, { status: 400 });
      }
      console.error('Promo insert error:', error);
      return NextResponse.json({ error: 'Échec de la création du code promo' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'CREATE_PROMO',
      targetType: 'promo_codes',
      targetId: data?.id,
      details: { code, discount, maxUses },
    });

    return NextResponse.json({ success: true, promo: data });
  } catch (err: unknown) {
    console.error('Unexpected promo POST error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('promo_codes').delete().eq('id', id);
    if (error) {
      console.error('Promo delete error:', error);
      return NextResponse.json({ error: 'Échec de la suppression' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'DELETE_PROMO',
      targetType: 'promo_codes',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Unexpected promo DELETE error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const { id, active } = body;
    if (!id || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('promo_codes').update({ active }).eq('id', id);
    if (error) {
      console.error('Promo patch error:', error);
      return NextResponse.json({ error: 'Échec de la mise à jour' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: active ? 'ACTIVATE_PROMO' : 'DEACTIVATE_PROMO',
      targetType: 'promo_codes',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Unexpected promo PATCH error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
