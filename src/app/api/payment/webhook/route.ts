import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use service role key for webhook (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CHARGILY_APP_SECRET = process.env.CHARGILY_APP_SECRET!;

/**
 * POST /api/payment/webhook
 * Receives Chargily Pay webhook and updates order status.
 * Chargily signs the body with HMAC-SHA256 using the App Secret.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('signature') || '';

    // 1. Verify webhook signature
    if (CHARGILY_APP_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', CHARGILY_APP_SECRET)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid Chargily webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log('Chargily webhook received:', event.type, event.id);

    // 2. Handle checkout.paid event
    if (event.type === 'checkout.paid') {
      const checkout = event.data;
      const metadata = checkout.metadata || {};
      const orderId = metadata.order_id;

      if (!orderId) {
        console.error('No order_id in webhook metadata');
        return NextResponse.json({ received: true });
      }

      // 3. Update order status to "processing" (payment confirmed, awaiting recharge)
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'processing',
          receipt_url: `chargily:${checkout.id}`,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Order update error:', updateError);
        return NextResponse.json({ error: 'Order update failed' }, { status: 500 });
      }

      console.log(`✅ Order ${orderId} marked as processing after Chargily payment`);

      // 4. Award points to user (10% of price)
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, points_to_award')
        .eq('id', orderId)
        .single();

      if (order?.user_id && order.points_to_award > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', order.user_id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ points: (profile.points || 0) + order.points_to_award })
            .eq('id', order.user_id);
        }
      }
    }

    // Handle checkout.failed event
    if (event.type === 'checkout.failed') {
      const checkout = event.data;
      const orderId = checkout.metadata?.order_id;

      if (orderId) {
        await supabase
          .from('orders')
          .update({ status: 'rejected' })
          .eq('id', orderId);

        console.log(`❌ Order ${orderId} rejected after Chargily payment failure`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    console.error('Webhook error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
