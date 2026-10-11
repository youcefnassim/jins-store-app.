import { NextResponse } from 'next/server';
import { getSupabaseAnon } from '@/lib/supabase/server';

export const revalidate = 60; // Cache for 60 seconds

// GET all games and their packages
export async function GET() {
  try {
    const supabase = getSupabaseAnon();
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*, packages:game_packages(*)');

    if (gamesError) {
      console.error('Games fetch error:', gamesError);
      return NextResponse.json({ error: 'Impossible de charger les jeux' }, { status: 400 });
    }

    // Format the response to match the frontend expectations
    const formattedGames = (games || []).map(game => ({
      ...game,
      category: game.category || 'Jeux',
      sort_order: game.sort_order || 0,
      packages: (game.packages || []).sort((a: any, b: any) => (a.price || 0) - (b.price || 0))
    })).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return NextResponse.json({ games: formattedGames });
  } catch (err: unknown) {
    console.error('Unexpected games API error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
