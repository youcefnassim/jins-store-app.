import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CHARGILY_API_KEY = process.env.CHARGILY_API_KEY!;
// Use test mode URL for development, live for production
const CHARGILY_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://pay.chargily.net/api/v2'
  : 'https://pay.chargily.net/test/api/v2';

/**
 * POST /api/payment/checkout
 * Creates a Chargily Pay V2 checkout session and returns the payment URL.
 * Body: { userId, playerId, zoneId, packageId, packageName, price, gameSlug }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      playerId,
      zoneId,
      packageId,
      packageName,
      price,
      gameSlug = 'mobile-legends',
      phone,
      locale = 'ar',
    } = body;

    if (!userId || !playerId || !price || !packageName) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (!CHARGILY_API_KEY) {
      return NextResponse.json({ error: 'Chargily API key non configurée' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jins-store-app-neon.vercel.app';

    // 1. Pre-create the order in Supabase with status "pending_payment"
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        game: gameSlug,
        package: packageName,
        player_id: playerId,
        zone_id: zoneId || null,
        phone: phone || null,
        payment_method: 'chargily',
        price: String(price),
        points_to_award: Math.floor(price * 0.1),
        receipt_url: '',
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Impossible de créer la commande' }, { status: 500 });
    }

    // 2. Create Chargily checkout session
    const checkoutPayload = {
      amount: price,
      currency: 'dzd',
      payment_method: 'edahabia', // supports CIB gEDAHABIA + Dahabia
      success_url: `${appUrl}/fr/order/success?id=${order.id}&method=chargily`,
      failure_url: `${appUrl}/fr/recharge?error=payment_failed&order=${order.id}`,
      webhook_endpoint: `${appUrl}/api/payment/webhook`,
      description: `Recharge ${packageName} - ${gameSlug}`,
      locale: locale,
      metadata: {
        order_id: order.id,
        user_id: userId,
        player_id: playerId,
        package: packageName,
      },
    };

    const chargilyResponse = await fetch(`${CHARGILY_BASE_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHARGILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutPayload),
    });

    const chargilyData = await chargilyResponse.json();

    if (!chargilyResponse.ok) {
      console.error('Chargily error:', chargilyData);
      // Clean up the pending order
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: chargilyData.message || 'Erreur Chargily Pay' },
        { status: 500 }
      );
    }

    // 3. Save Chargily checkout ID to order for webhook tracking
    await supabase
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
