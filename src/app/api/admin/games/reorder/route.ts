import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const orderedGames = body.orderedGames;
    if (!orderedGames || !Array.isArray(orderedGames)) {
      return NextResponse.json({ error: 'Format invalide.' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    for (const game of orderedGames) {
      if (!game.id || typeof game.sort_order !== 'number') continue;
      const { error } = await admin
        .from('games')
        .update({ sort_order: game.sort_order })
        .eq('id', game.id);

      if (error) {
        console.error('Error updating game sort_order:', error);
      }
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'REORDER_GAMES',
      targetType: 'games',
      details: { count: orderedGames.length },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Unexpected games reorder error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
