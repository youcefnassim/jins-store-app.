import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin } from '@/lib/supabase/server';

const DEFAULT_ITEMS = [
  { id: '1', text: "OFFRE SPECIALE : +10% de diamants bonus sur PUBG Mobile jusqu'à minuit !", type: 'flame' },
  { id: '2', text: 'Paiement Edahabia & CIB bientôt disponible', type: 'shield' },
  { id: '3', text: 'Support client 24/7 sur WhatsApp', type: 'support' },
];

async function loadMarquee() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', 'marquee')
    .maybeSingle();

  if (error || !data?.value) return DEFAULT_ITEMS;
  try {
    const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    return Array.isArray(parsed) ? parsed : DEFAULT_ITEMS;
  } catch {
    return DEFAULT_ITEMS;
  }
}

import { logAdminAction } from '@/lib/supabase/audit';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const items = await loadMarquee();
    return NextResponse.json({ items });
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

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('site_settings').upsert({
      key: 'marquee',
      value: body.items,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Marquee update error:', error);
      return NextResponse.json({ error: 'Échec de mise à jour du bandeau' }, { status: 500 });
    }

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
