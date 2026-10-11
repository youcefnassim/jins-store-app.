import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';

function sanitizeLink(link?: string): string {
  if (!link) return '/';
  const trimmed = link.trim();
  // Only allow relative paths or secure http/https URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  return '/';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data: banners, error } = await admin
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      if (
        error.code === '42P01' ||
        (error.message && error.message.toLowerCase().includes('schema cache'))
      ) {
        return NextResponse.json({ banners: [], table_missing: true });
      }
      console.error('Admin banners fetch error:', error);
      return NextResponse.json({ error: 'Impossible de charger les bannières' }, { status: 500 });
    }

    return NextResponse.json({ banners: banners || [], table_missing: false });
  } catch (err: unknown) {
    console.error('Unexpected admin banners GET error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 150) : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) : '';
    const image = typeof body.image === 'string' ? body.image.trim() : '';
    const link = sanitizeLink(body.link);
    const color = typeof body.color === 'string' ? body.color.trim().slice(0, 50) : '';
    const sort_order = Number.isInteger(body.sort_order) ? body.sort_order : 0;

    if (!title || !image) {
      return NextResponse.json({ error: 'Titre et image requis' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('banners')
      .insert([{ title, description, image, link, color, sort_order }])
      .select()
      .single();

    if (error) {
      console.error('Banner insert error:', error);
      return NextResponse.json({ error: 'Échec de création de la bannière' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'CREATE_BANNER',
      targetType: 'banners',
      targetId: data?.id,
      details: { title },
    });

    return NextResponse.json({ banner: data });
  } catch (err: unknown) {
    console.error('Unexpected banner POST error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 150) : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) : '';
    const image = typeof body.image === 'string' ? body.image.trim() : '';
    const link = sanitizeLink(body.link);
    const color = typeof body.color === 'string' ? body.color.trim().slice(0, 50) : '';
    const sort_order = Number.isInteger(body.sort_order) ? body.sort_order : 0;

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('banners')
      .update({ title, description, image, link, color, sort_order })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Banner update error:', error);
      return NextResponse.json({ error: 'Échec de modification de la bannière' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'UPDATE_BANNER',
      targetType: 'banners',
      targetId: id,
      details: { title },
    });

    return NextResponse.json({ banner: data });
  } catch (err: unknown) {
    console.error('Unexpected banner PUT error:', err);
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
    const { error } = await admin.from('banners').delete().eq('id', id);
    if (error) {
      console.error('Banner delete error:', error);
      return NextResponse.json({ error: 'Échec de suppression de la bannière' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'DELETE_BANNER',
      targetType: 'banners',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Unexpected banner DELETE error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
