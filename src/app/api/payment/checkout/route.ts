import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser, getSupabaseAdmin } from '@/lib/supabase/server';

const CHARGILY_API_KEY = process.env.CHARGILY_API_KEY!;
const CHARGILY_BASE_URL = process.env.CHARGILY_MODE === 'live'
  ? 'https://pay.chargily.net/api/v2'
  : 'https://pay.chargily.net/test/api/v2';

/**
 * POST /api/payment/checkout
 * Creates a Chargily Pay V2 checkout session and returns the payment URL.
 * Body: { playerId, zoneId, packageId, packageName, gameSlug, phone, locale }
 */
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limiting: max 10 checkout attempts per 5 minutes per IP
  const rateLimitResponse = checkRateLimit(request, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
    keyPrefix: 'payment_checkout',
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const {
      playerId,
      zoneId,
      packageId,
      packageName,
      gameSlug = 'mobile-legends',
      phone,
      locale = 'fr',
      promoCode: promoCodeRaw,
      quantity: rawQuantity,
    } = body;

    const quantity = Math.max(1, Math.min(99, Number(rawQuantity) || 1));

    if (!playerId || !packageId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (!CHARGILY_API_KEY) {
      return NextResponse.json({ error: 'Chargily API key non configurée' }, { status: 500 });
    }

    const admin = getSupabaseAdmin();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jins-store-app-neon.vercel.app';
    const safeLocale = ['fr', 'ar', 'en'].includes(locale) ? locale : 'fr';

    const { data: pkg, error: pkgError } = await admin
      .from('game_packages')
      .select('id, label, price, active')
      .eq('id', packageId)
      .single();

    if (pkgError || !pkg || pkg.active === false) {
      return NextResponse.json({ error: 'Package invalide' }, { status: 400 });
    }

    let price = Number(pkg.price) * quantity;
    let promoCode: string | null = null;

    if (promoCodeRaw) {
      const code = String(promoCodeRaw).toUpperCase().trim();
      const { data: promo } = await admin
        .from('promo_codes')
        .select('id, code, discount_percentage, current_uses, max_uses, active')
        .eq('code', code)
        .single();

      if (
        promo &&
        promo.active &&
        promo.current_uses < promo.max_uses &&
        promo.discount_percentage > 0
      ) {
        const { data: updatedPromo } = await admin
          .from('promo_codes')
          .update({ current_uses: promo.current_uses + 1 })
          .eq('id', promo.id)
          .eq('current_uses', promo.current_uses)
          .select('id');

        if (updatedPromo && updatedPromo.length > 0) {
          price = Math.round(price * (1 - promo.discount_percentage / 100));
          promoCode = promo.code;
        }
      }
    }

    const pointsToAward = Math.floor(price * 0.1);

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        game: gameSlug,
        package: quantity > 1 ? `${pkg.label || packageName} (x${quantity})` : (pkg.label || packageName),
        player_id: playerId,
        zone_id: zoneId || null,
        phone: phone || null,
        payment_method: 'chargily',
        price: String(price),
        points_to_award: pointsToAward,
        points_awarded: false,
        receipt_url: '',
        promo_code: promoCode,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Impossible de créer la commande' }, { status: 500 });
    }

    const checkoutPayload = {
      amount: price,
      currency: 'dzd',
      payment_method: 'edahabia',
      success_url: `${appUrl}/${safeLocale}/order/success?id=${order.id}&method=chargily`,
      failure_url: `${appUrl}/${safeLocale}/recharge?error=payment_failed&order=${order.id}`,
      webhook_endpoint: `${appUrl}/api/payment/webhook`,
      description: `Recharge ${pkg.label || packageName} - ${gameSlug}`,
      locale: safeLocale === 'ar' ? 'ar' : 'fr',
      metadata: {
        order_id: order.id,
        user_id: user.id,
        player_id: playerId,
        package: pkg.label || packageName,
      },
    };

    const chargilyResponse = await fetch(`${CHARGILY_BASE_URL}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CHARGILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutPayload),
    });

    const chargilyData = await chargilyResponse.json();

    if (!chargilyResponse.ok) {
      console.error('Chargily error:', chargilyData);
      await admin.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: chargilyData.message || 'Erreur Chargily Pay' },
        { status: 500 }
      );
    }

    await admin
      .from('orders')
      .update({ receipt_url: `chargily:${chargilyData.id}` })
      .eq('id', order.id);

    return NextResponse.json({
      checkout_url: chargilyData.checkout_url,
      order_id: order.id,
      checkout_id: chargilyData.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    console.error('Checkout route error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
