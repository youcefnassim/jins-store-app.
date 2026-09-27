import { NextResponse, NextRequest } from 'next/server';
import { supabaseServer, checkAdminAuth } from '@/lib/supabase/server';

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ orders: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST to update order status + award points
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { orderId, action, userId, pointsToAward } = await request.json();
    const newStatus = action === 'approve' ? 'completed' : 'rejected';

    // 1. Update order status
    const { error: updateError } = await supabaseServer
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateError) throw new Error(updateError.message);

    // 2. Award points if approved
    if (action === 'approve' && pointsToAward > 0) {
      const { data: userProfile } = await supabaseServer
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      if (userProfile) {
        await supabaseServer
          .from('profiles')
          .update({ points: (userProfile.points || 0) + pointsToAward })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
