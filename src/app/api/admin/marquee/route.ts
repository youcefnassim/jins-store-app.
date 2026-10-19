import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';
import { getSiteSetting, saveSiteSetting } from '@/lib/settingsStore';

const DEFAULT_ITEMS = [
  { id: '1', text: "OFFRE SPECIALE : +10% de diamants bonus sur PUBG Mobile jusqu'à minuit !", type: 'flame' },
  { id: '2', text: 'Paiement Edahabia & CIB bientôt disponible', type: 'shield' },
  { id: '3', text: 'Support client 24/7 sur WhatsApp', type: 'support' },
];

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const items = await getSiteSetting('marquee', DEFAULT_ITEMS);
    return NextResponse.json({ items: Array.isArray(items) ? items : DEFAULT_ITEMS });
  } catch {
    return NextResponse.json({ items: DEFAULT_ITEMS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: 'Invalid items payload' }, { status: 400 });
    }

    await saveSiteSetting('marquee', body.items);

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'UPDATE_MARQUEE',
      targetType: 'site_settings',
      details: { itemCount: body.items.length },
    });

    return NextResponse.json({ success: true, items: body.items });
  } catch (err: unknown) {
    console.error('Admin marquee error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

