import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';
import { DEFAULT_PAYMENT_SETTINGS, PaymentAccountsSettings } from '@/app/api/settings/payments/route';

async function loadPaymentSettings(): Promise<PaymentAccountsSettings> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('site_settings')
    .select('key, value')
    .in('key', ['payment_accounts', 'flexy_phone']);

  if (error || !data || data.length === 0) return DEFAULT_PAYMENT_SETTINGS;

  const payRow = data.find(d => d.key === 'payment_accounts');
  const flexyRow = data.find(d => d.key === 'flexy_phone');

  let parsed = DEFAULT_PAYMENT_SETTINGS;
  if (payRow?.value) {
    const val = typeof payRow.value === 'string' ? JSON.parse(payRow.value) : payRow.value;
    parsed = {
      ...DEFAULT_PAYMENT_SETTINGS,
      ...val,
      baridimob: { ...DEFAULT_PAYMENT_SETTINGS.baridimob, ...(val.baridimob || {}) },
      ccp: { ...DEFAULT_PAYMENT_SETTINGS.ccp, ...(val.ccp || {}) },
      redotpay: { ...DEFAULT_PAYMENT_SETTINGS.redotpay, ...(val.redotpay || {}) },
      flexy: { ...DEFAULT_PAYMENT_SETTINGS.flexy, ...(val.flexy || {}) },
    };
  }

  if (flexyRow?.value) {
    const fPhone = typeof flexyRow.value === 'string' ? flexyRow.value : String(flexyRow.value?.phone || '');
    if (fPhone) parsed.flexy.phone = fPhone;
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const settings = await loadPaymentSettings();
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    console.error('Admin get payment settings error:', err);
    return NextResponse.json({ settings: DEFAULT_PAYMENT_SETTINGS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const settingsPayload: PaymentAccountsSettings = {
      baridimob: {
        rip: String(body.baridimob?.rip || DEFAULT_PAYMENT_SETTINGS.baridimob.rip).trim(),
        holder: String(body.baridimob?.holder || DEFAULT_PAYMENT_SETTINGS.baridimob.holder).trim(),
      },
      ccp: {
        account: String(body.ccp?.account || DEFAULT_PAYMENT_SETTINGS.ccp.account).trim(),
        cle: String(body.ccp?.cle || DEFAULT_PAYMENT_SETTINGS.ccp.cle).trim(),
        holder: String(body.ccp?.holder || DEFAULT_PAYMENT_SETTINGS.ccp.holder).trim(),
      },
      redotpay: {
        id: String(body.redotpay?.id || DEFAULT_PAYMENT_SETTINGS.redotpay.id).trim(),
      },
      flexy: {
        phone: String(body.flexy?.phone || DEFAULT_PAYMENT_SETTINGS.flexy.phone).trim(),
        feePercent: Math.max(0, Math.min(100, Number(body.flexy?.feePercent ?? DEFAULT_PAYMENT_SETTINGS.flexy.feePercent))),
      },
      defaultMarginPercent: Math.max(1, Math.min(100, Number(body.defaultMarginPercent ?? DEFAULT_PAYMENT_SETTINGS.defaultMarginPercent))),
    };

    const admin = getSupabaseAdmin();

    // 1. Upsert payment_accounts
    const { error: err1 } = await admin.from('site_settings').upsert({
      key: 'payment_accounts',
      value: settingsPayload,
      updated_at: new Date().toISOString(),
    });

    if (err1) {
      console.error('Error saving payment_accounts:', err1);
      return NextResponse.json({ error: 'Échec de la sauvegarde des coordonnées' }, { status: 500 });
    }

    // 2. Also keep flexy_phone in sync
    await admin.from('site_settings').upsert({
      key: 'flexy_phone',
      value: settingsPayload.flexy.phone,
      updated_at: new Date().toISOString(),
    });

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'UPDATE_PAYMENT_SETTINGS',
      targetType: 'site_settings',
      details: settingsPayload as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ success: true, settings: settingsPayload });
  } catch (err: unknown) {
    console.error('Admin save payment settings error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
