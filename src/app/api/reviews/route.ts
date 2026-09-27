import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET all approved reviews for public display
export async function GET() {
  try {
    const { data: reviews, error } = await supabaseServer
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ reviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, game, rating, comment, user_id } = body;

    if (!name || !rating || !comment) {
      return NextResponse.json({ error: "Nom, note et commentaire obligatoires" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('reviews')
      .insert([{ name, game, rating, comment, user_id, approved: false }]); // always false initially

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
