import { NextResponse, NextRequest } from 'next/server';
import {
  awardPointsOnce,
  checkAdminAuth,
  getSupabaseAdmin,
} from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const offset = (page - 1) * limit;

    const admin = getSupabaseAdmin();
    const { data, error, count } = await admin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching admin orders:', error);
      return NextResponse.json({ error: 'Impossible de récupérer les commandes' }, { status: 500 });
    }

    // Enhance receipts with signed URLs where applicable (Fixes S4)
    const enhancedOrders = await Promise.all(
      (data || []).map(async (order) => {
        let signedReceiptUrl = order.receipt_url;

        if (order.receipt_url && !order.receipt_url.startsWith('chargily:')) {
          try {
            // Check if it's a direct storage path (e.g., "userId/123.jpg") or contains /receipts/
            let storagePath = order.receipt_url;
            if (storagePath.includes('/receipts/')) {
              storagePath = storagePath.split('/receipts/').pop()?.split('?')[0] || storagePath;
            }

            if (!storagePath.startsWith('http')) {
              const { data: signedData } = await admin.storage
                .from('receipts')
                .createSignedUrl(storagePath, 3600 * 24); // 24 hours
              if (signedData?.signedUrl) {
                signedReceiptUrl = signedData.signedUrl;
              }
            }
          } catch {
            // Keep original receipt_url as fallback
          }
        }

        return {
          ...order,
          receipt_url: signedReceiptUrl,
        };
      })
    );

    return NextResponse.json({
      orders: enhancedOrders,
      pagination: {
        page,
        limit,
        total: count ?? enhancedOrders.length,
      },
    });
  } catch (err: unknown) {
    console.error('Admin orders GET error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { orderId, action } = await request.json();
    if (!orderId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: order, error: fetchError } = await admin
      .from('orders')
      .select('id, user_id, points_to_award, status, game, package, price')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      console.error('Admin order fetch error:', fetchError);
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    if (order.status === 'completed' || order.status === 'rejected') {
      return NextResponse.json({ error: 'Commande déjà traitée' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'completed' : 'rejected';

    const { error: updateError } = await admin
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json({ error: 'Échec de la mise à jour de la commande' }, { status: 500 });
    }

    // Award loyalty points atomically
    if (action === 'approve' && order.user_id) {
      await awardPointsOnce(
        admin,
        order.id,
        order.user_id,
        order.points_to_award || 0
      );
    }

    // Audit Log for the action (Fixes S10)
    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: action === 'approve' ? 'APPROVE_ORDER' : 'REJECT_ORDER',
      targetType: 'orders',
      targetId: orderId,
      details: {
        game: order.game,
        package: order.package,
        price: order.price,
        userId: order.user_id,
      },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: unknown) {
    console.error('Admin orders POST error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
