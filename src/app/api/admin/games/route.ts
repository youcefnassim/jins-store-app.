import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, checkAdminAuth } from '@/lib/supabase/server';

// POST: Add a new game
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { name, slug, emoji, image_url, packages } = await request.json();

    // 1. Insert Game
    const { data: game, error: gameError } = await supabaseServer
      .from('games')
      .insert([{ name, slug, emoji, image_url }])
      .select()
      .single();

    if (gameError) throw new Error(gameError.message);

    // 2. Insert Packages if any
    if (packages && packages.length > 0) {
      const packagesToInsert = packages.map((pkg: any) => ({
        game_id: game.id,
        label: pkg.label,
        price: pkg.price
      }));

      const { error: pkgError } = await supabaseServer
        .from('game_packages')
        .insert(packagesToInsert);

      if (pkgError) throw new Error(pkgError.message);
    }

    return NextResponse.json({ success: true, game });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a game
export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "L'ID du jeu est requis." }, { status: 400 });

    const { error } = await supabaseServer
      .from('games')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
