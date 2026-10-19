import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';
import { saveSiteSetting } from '@/lib/settingsStore';

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const usd = Math.max(1, Number(body.USD || body.usd || 242));
    const eur = Math.max(1, Number(body.EUR || body.eur || 275));

    const rates = { USD: usd, EUR: eur, DZD: 1 };

    await saveSiteSetting('currency_rates', rates);

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'UPDATE_CURRENCY_RATES',
      targetType: 'site_settings',
      details: rates,
    });

    return NextResponse.json({ success: true, rates });
  } catch (err: unknown) {
    console.error('Admin currency rates error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
