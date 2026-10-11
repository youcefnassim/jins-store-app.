import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const admin = getSupabaseAdmin();

    // Select only lightweight aggregated columns, limiting to latest 2000 orders if large
    const { data: orders, error: ordersErr } = await admin
      .from('orders')
      .select('status, price, created_at, game, payment_method')
      .order('created_at', { ascending: false })
      .limit(2000);

    if (ordersErr) {
      console.error('Stats orders fetch error:', ordersErr);
      return NextResponse.json({ error: 'Impossible de calculer les statistiques' }, { status: 500 });
    }

    const { count: usersCount, error: usersErr } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersErr) {
      console.error('Stats users count error:', usersErr);
    }

    const totalOrders = orders?.length ?? 0;
    const pendingOrders = orders?.filter((o) => o.status === 'pending').length ?? 0;
    const completedOrders = orders?.filter((o) => o.status === 'completed').length ?? 0;
    const rejectedOrders = orders?.filter((o) => o.status === 'rejected').length ?? 0;

    const totalRevenue =
      orders
        ?.filter((o) => o.status === 'completed')
        .reduce((sum, o) => {
          const num = parseFloat(String(o.price ?? '').replace(/[^0-9.]/g, '') || '0');
          return sum + (isNaN(num) ? 0 : num);
        }, 0) ?? 0;

    // Real payment method breakdown from DB
    const methodCounts: Record<string, number> = {};
    orders?.forEach((o) => {
      const key = (o.payment_method || 'unknown').trim() || 'unknown';
      methodCounts[key] = (methodCounts[key] ?? 0) + 1;
    });

    const methodColors = [
      'bg-emerald-500',
      'bg-amber-500',
      'bg-blue-500',
      'bg-violet-500',
      'bg-rose-500',
      'bg-cyan-500',
    ];

    const paymentBreakdown = Object.entries(methodCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        name,
        count,
        percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
        color: methodColors[i % methodColors.length],
      }));

    const gameMap: Record<string, number> = {};
    orders?.forEach((o) => {
      if (o.game) gameMap[o.game] = (gameMap[o.game] ?? 0) + 1;
    });
    const topGames = Object.entries(gameMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = orders?.filter((o) => o.created_at?.startsWith(dateStr)).length ?? 0;
      last7Days.push({ date: dateStr, count });
    }

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      rejectedOrders,
      totalRevenue,
      netProfit: null,
      marginPercent: null,
      paymentBreakdown,
      stockAlerts: [],
      usersCount: usersCount ?? 0,
      topGames,
      last7Days,
    });
  } catch (err: unknown) {
    console.error('Unexpected stats error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
