import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, checkAdminAuth } from '@/lib/supabase/server';

// GET all promo codes
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { data: promos, error } = await supabaseServer
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ promos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST new promo code
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { code, discount_percentage, max_uses } = await request.json();

    if (!code || !discount_percentage || !max_uses) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('promo_codes')
      .insert([{ 
        code: code.toUpperCase(), 
        discount_percentage: parseInt(discount_percentage), 
        max_uses: parseInt(max_uses) 
      }]);

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: "Ce code existe déjà" }, { status: 400 });
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE a promo code
export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const { error } = await supabaseServer
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH toggle active status
export async function PATCH(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { id, active } = await request.json();

    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const { error } = await supabaseServer
      .from('promo_codes')
      .update({ active })
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
