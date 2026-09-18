import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  'https://urpgragqoaodncenylmn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGdyYWdxb2FvZG5jZW55bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjI3MTgsImV4cCI6MjEwNTEzODcxOH0.ObcE8IX3EHuMs-SehX5IV2fXjtsmPcyxOWahvtt6INs'
);

export async function GET() {
  try {
    // Fetch all orders
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('status, price, created_at, game');
    if (ordersErr) throw new Error(ordersErr.message);

    // Fetch all users
    const { count: usersCount, error: usersErr } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (usersErr) throw new Error(usersErr.message);

    const totalOrders = orders?.length ?? 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length ?? 0;
    const completedOrders = orders?.filter(o => o.status === 'completed').length ?? 0;
    const rejectedOrders = orders?.filter(o => o.status === 'rejected').length ?? 0;

    // Calculate total revenue from completed orders (assuming price format is "1500 DZD")
    const totalRevenue = orders
      ?.filter(o => o.status === 'completed')
      .reduce((sum, o) => {
        const num = parseFloat(o.price?.replace(/[^0-9.]/g, '') ?? '0');
        return sum + (isNaN(num) ? 0 : num);
      }, 0) ?? 0;

    // Orders per game
    const gameMap: Record<string, number> = {};
    orders?.forEach(o => {
      if (o.game) gameMap[o.game] = (gameMap[o.game] ?? 0) + 1;
    });
    const topGames = Object.entries(gameMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Orders over the last 7 days
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = orders?.filter(o => o.created_at?.startsWith(dateStr)).length ?? 0;
      last7Days.push({ date: dateStr, count });
    }

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      rejectedOrders,
      totalRevenue,
      usersCount: usersCount ?? 0,
      topGames,
      last7Days,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
