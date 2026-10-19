import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser, getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const name = body.name ? String(body.name).trim() : null;

    if (!name) {
      return NextResponse.json({ error: 'Le nom ne peut pas être vide' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: name,
      }, { onConflict: 'id' });

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: 'Échec de la mise à jour du profil' }, { status: 500 });
    }

    return NextResponse.json({ success: true, name });
  } catch (err: unknown) {
    console.error('User profile update error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
