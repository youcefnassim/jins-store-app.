import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limiting: max 10 validations per minute per IP (Fixes S1)
  const rateLimitResponse = checkRateLimit(request, {
    limit: 10,
    windowMs: 60 * 1000,
    keyPrefix: 'promo_validate',
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const code = typeof body.code === 'string' ? body.code.toUpperCase().trim() : '';

    if (!code) {
      return NextResponse.json({ error: 'Code promo manquant' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: promo, error } = await admin
      .from('promo_codes')
      .select('id, code, discount_percentage, current_uses, max_uses, active')
      .eq('code', code)
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: 'Code promo invalide' }, { status: 404 });
    }

    if (!promo.active) {
      return NextResponse.json({ error: 'Ce code promo est expiré ou inactif' }, { status: 400 });
    }

    if (promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ error: "Ce code promo a atteint sa limite d'utilisation" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discount_percentage: promo.discount_percentage,
      promo_id: promo.id,
    });
  } catch (err: unknown) {
    console.error('Promo validation error:', err);
    return NextResponse.json({ error: 'Impossible de valider le code promo' }, { status: 500 });
  }
}
