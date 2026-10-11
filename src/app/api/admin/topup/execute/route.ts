import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin, awardPointsOnce } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';
import { getActiveTopupProvider } from '@/lib/topup';
import { sendDiscordTopupDelivered } from '@/lib/discord/webhook';

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { orderId, zoneId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requis' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    if (order.status === 'completed') {
      return NextResponse.json({ error: 'Cette commande a déjà été complétée et livrée' }, { status: 400 });
    }

    const provider = getActiveTopupProvider();

    // Execute the direct recharge via provider
    const topupResult = await provider.executeTopup({
      orderId: order.id,
      game: order.game,
      package: order.package,
      playerId: order.player_id,
      zoneId: zoneId || undefined,
      amount: parseFloat(order.price) || 0,
    });

    if (!topupResult.success) {
      return NextResponse.json({
        success: false,
        error: topupResult.message || 'Échec de la recharge auprès du fournisseur',
        provider: topupResult.provider,
      }, { status: 422 });
    }

    // Mark order as completed in database
    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'completed',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status after topup:', updateError);
    }

    // Award loyalty points
    if (order.user_id && order.points_to_award) {
      await awardPointsOnce(admin, order.id, order.user_id, order.points_to_award);
    }

    // Log admin audit action
    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'APPROVE_ORDER',
      targetType: 'orders',
      targetId: orderId,
      details: {
        method: 'AUTO_TOPUP_API',
        provider: topupResult.provider,
        transactionId: topupResult.transactionId,
        game: order.game,
        player_id: order.player_id,
        price: order.price,
      },
    });

    // Notify Discord channel asynchronously
    sendDiscordTopupDelivered({
      orderId: order.id,
      game: order.game,
      package: order.package,
      playerId: order.player_id,
      provider: topupResult.provider,
      transactionId: topupResult.transactionId,
      status: topupResult.status,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      topup: topupResult,
    });
  } catch (err: unknown) {
    console.error('Auto topup execution route error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
