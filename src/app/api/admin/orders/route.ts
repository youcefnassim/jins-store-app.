import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  'https://urpgraqgoaodncenylmn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGdyYWdxb2FvZG5jZW55bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjI3MTgsImV4cCI6MjEwNTEzODcxOH0.ObcE8IX3EHuMs-SehX5IV2fXjtsmPcyxOWahvtt6INs'
);

// GET all orders
export async function GET() {
  try {
    const { data, error } = await supabase
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
    const { orderId, action, userId, pointsToAward } = await request.json();

    const newStatus = action === 'approve' ? 'completed' : 'rejected';

    // 1. Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateError) throw new Error(updateError.message);

    // 2. Award points if approved
    if (action === 'approve' && pointsToAward > 0) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      if (userProfile) {
        await supabase
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
