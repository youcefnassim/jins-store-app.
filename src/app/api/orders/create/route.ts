import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  'https://urpgraqgoaodncenylmn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGdyYWdxb2FvZG5jZW55bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjI3MTgsImV4cCI6MjEwNTEzODcxOH0.ObcE8IX3EHuMs-SehX5IV2fXjtsmPcyxOWahvtt6INs'
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const game = formData.get('game') as string;
    const packageId = formData.get('packageId') as string;
    const packageName = formData.get('packageName') as string;
    const playerId = formData.get('playerId') as string;
    const price = formData.get('price') as string;
    const pointsToAward = parseInt(formData.get('pointsToAward') as string) || 0;
    const receiptFile = formData.get('receiptFile') as File;

    if (!receiptFile) {
      return NextResponse.json({ error: 'Receipt file is required' }, { status: 400 });
    }

    // 1. Upload receipt to Supabase Storage
    const timestamp = Date.now();
    const fileExtension = receiptFile.name.split('.').pop();
    const fileName = `${userId}/${timestamp}.${fileExtension}`;

    const arrayBuffer = await receiptFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, buffer, {
        contentType: receiptFile.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
    }

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);

    // 3. Create order in DB
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        game,
        package: packageName,
        player_id: playerId,
        price,
        points_to_award: pointsToAward,
        receipt_url: publicUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: 'Order creation failed: ' + orderError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: orderData.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
