import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin, mapReview } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data: reviews, error } = await admin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin reviews GET error:', error);
      return NextResponse.json({ error: 'Impossible de charger les avis' }, { status: 500 });
    }

    return NextResponse.json({
      reviews: (reviews || []).map((r) => mapReview(r)),
    });
  } catch (err: unknown) {
    console.error('Unexpected admin reviews GET error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const { id, approved } = body;

    if (!id || typeof approved !== 'boolean') {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('reviews')
      .update({ approved })
      .eq('id', id);

    if (error) {
      console.error('Admin review PATCH error:', error);
      return NextResponse.json({ error: 'Échec de la modification du statut' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: approved ? 'APPROVE_REVIEW' : 'UNAPPROVE_REVIEW',
      targetType: 'reviews',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Unexpected admin review PATCH error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "L'ID de l'avis est requis." }, { status: 400 });

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('reviews').delete().eq('id', id);

    if (error) {
      console.error('Admin review DELETE error:', error);
      return NextResponse.json({ error: "Échec de suppression de l'avis" }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'DELETE_REVIEW',
      targetType: 'reviews',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Unexpected admin review DELETE error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
