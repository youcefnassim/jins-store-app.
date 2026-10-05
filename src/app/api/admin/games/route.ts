import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, checkAdminAuth } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Create a service client that bypasses RLS if the key is available
const getAdminSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, serviceKey);
};

// POST: Add a new game
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const adminSupabase = getAdminSupabase();
    const { name, slug, emoji, image_url, packages } = await request.json();

    // 1. Insert Game
    const { data: game, error: gameError } = await adminSupabase
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

      const { error: pkgError } = await adminSupabase
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

    const adminSupabase = getAdminSupabase();
    const { error } = await adminSupabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update a game and its packages
export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { id, name, slug, emoji, image_url, packages } = await request.json();

    if (!id) return NextResponse.json({ error: "L'ID du jeu est requis." }, { status: 400 });

    const adminSupabase = getAdminSupabase();

    // 1. Update Game
    const { error: gameError } = await adminSupabase
      .from('games')
      .update({ name, slug, emoji, image_url })
      .eq('id', id);

    if (gameError) throw new Error(gameError.message);

    // 2. Update Packages (Delete old, insert new)
    const { error: deletePkgError } = await adminSupabase
      .from('game_packages')
      .delete()
      .eq('game_id', id);
      
    if (deletePkgError) throw new Error(deletePkgError.message);

    if (packages && packages.length > 0) {
      const packagesToInsert = packages.map((pkg: any) => ({
        game_id: id,
        label: pkg.label,
        price: pkg.price
      }));

      const { error: insertPkgError } = await adminSupabase
        .from('game_packages')
        .insert(packagesToInsert);

      if (insertPkgError) throw new Error(insertPkgError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
