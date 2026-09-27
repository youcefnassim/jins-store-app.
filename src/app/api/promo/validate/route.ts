import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code promo manquant" }, { status: 400 });
    }

    const { data: promo, error } = await supabaseServer
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: "Code promo invalide" }, { status: 404 });
    }

    if (!promo.active) {
      return NextResponse.json({ error: "Ce code promo est expiré ou inactif" }, { status: 400 });
    }

    if (promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ error: "Ce code promo a atteint sa limite d'utilisation" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      discount_percentage: promo.discount_percentage,
      promo_id: promo.id
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
