import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/payment/webhook
 * Chargily Pay webhook — verifies HMAC, updates order status.
 * Points are awarded only when an admin marks the order completed
 * (avoids double-credit with admin approve).
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.CHARGILY_APP_SECRET;
    if (!secret) {
      console.error('CHARGILY_APP_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('signature') || '';

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (!signature || signature !== expectedSignature) {
      console.error('Invalid Chargily webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const admin = getSupabaseAdmin();

    if (event.type === 'checkout.paid') {
      const checkout = event.data;
      const orderId = checkout.metadata?.order_id;

      if (!orderId) {
        return NextResponse.json({ received: true });
      }

      const { error: updateError } = await admin
        .from('orders')
        .update({
          status: 'processing',
          receipt_url: `chargily:${checkout.id}`,
        })
        .eq('id', orderId)
        .in('status', ['pending']);

      if (updateError) {
        console.error('Order update error:', updateError);
        return NextResponse.json({ error: 'Order update failed' }, { status: 500 });
      }
    }

    if (event.type === 'checkout.failed') {
      const checkout = event.data;
      const orderId = checkout.metadata?.order_id;

      if (orderId) {
        await admin
          .from('orders')
          .update({ status: 'rejected' })
          .eq('id', orderId)
          .in('status', ['pending']);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    console.error('Webhook error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
