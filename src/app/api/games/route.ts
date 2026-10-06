import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET all games and their packages
export async function GET() {
  try {
    const { data: games, error: gamesError } = await supabaseServer
      .from('games')
      .select('*, packages:game_packages(*)');

    if (gamesError) {
      return NextResponse.json({ error: gamesError.message }, { status: 400 });
    }

    // Format the response to match the frontend expectations
    const formattedGames = games.map(game => ({
      ...game,
      category: game.category || 'Jeux',
      sort_order: game.sort_order || 0,
      packages: game.packages.sort((a: any, b: any) => a.price - b.price) // Sort by price ascending
    })).sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json({ games: formattedGames });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
