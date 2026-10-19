import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser, getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const isAdmin = user.app_metadata?.role === 'admin';

    // 1. Fetch orders for this user
    const { data: userOrders, error: userOrdersErr } = await admin
      .from('orders')
      .select('id, game, package, price, status, player_id, zone_id, created_at, receipt_url, payment_method')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (userOrdersErr) {
      console.error('Error fetching user orders:', userOrdersErr);
    }

    let orders = userOrders || [];

    // 2. If user is admin and has 0 personal orders, or requested all, include recent store orders
    const { searchParams } = new URL(request.url);
    const scopeAll = searchParams.get('scope') === 'all';

    if (isAdmin && (scopeAll || orders.length === 0)) {
      const { data: allOrders } = await admin
        .from('orders')
        .select('id, game, package, price, status, player_id, zone_id, created_at, receipt_url, payment_method')
        .order('created_at', { ascending: false })
        .limit(20);

      if (allOrders && allOrders.length > 0) {
        orders = allOrders;
      }
    }

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        game: o.game,
        amount: o.package,
        package: o.package,
        price: o.price,
        status: o.status,
        playerId: o.player_id,
        zoneId: o.zone_id,
        paymentMethod: o.payment_method,
        receiptUrl: o.receipt_url,
        createdAt: o.created_at,
      })),
      isAdmin,
    });
  } catch (err: unknown) {
    console.error('User orders GET error:', err);
    return NextResponse.json({ error: 'Erreur lors du chargement des commandes' }, { status: 500 });
  }
}
