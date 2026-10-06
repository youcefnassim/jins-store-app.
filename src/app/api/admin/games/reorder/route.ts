import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const getAdminSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, serviceKey);
};

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { orderedGames } = await request.json();

    if (!orderedGames || !Array.isArray(orderedGames)) {
      return NextResponse.json({ error: "Format invalide." }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Use a loop to update since Supabase doesn't easily support bulk update of different values via JS client unless upserting
    for (const game of orderedGames) {
      const { error } = await adminSupabase
        .from('games')
        .update({ sort_order: game.sort_order })
        .eq('id', game.id);
      
      if (error) {
        console.error("Error updating sort_order:", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
