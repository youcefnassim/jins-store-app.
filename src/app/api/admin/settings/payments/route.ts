import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';
import { DEFAULT_PAYMENT_SETTINGS, PaymentAccountsSettings } from '@/app/api/settings/payments/route';
import { getSiteSetting, saveSiteSetting } from '@/lib/settingsStore';

async function loadPaymentSettings(): Promise<PaymentAccountsSettings> {
  const paySaved = await getSiteSetting<PaymentAccountsSettings | null>('payment_accounts', null);
  const flexyPhone = await getSiteSetting<string | null>('flexy_phone', null);
  const whatsapp = await getSiteSetting<string | null>('whatsapp', null);

  let parsed: PaymentAccountsSettings = {
    ...DEFAULT_PAYMENT_SETTINGS,
    ...(paySaved || {}),
    baridimob: { ...DEFAULT_PAYMENT_SETTINGS.baridimob, ...(paySaved?.baridimob || {}) },
    ccp: { ...DEFAULT_PAYMENT_SETTINGS.ccp, ...(paySaved?.ccp || {}) },
    redotpay: { ...DEFAULT_PAYMENT_SETTINGS.redotpay, ...(paySaved?.redotpay || {}) },
    flexy: { ...DEFAULT_PAYMENT_SETTINGS.flexy, ...(paySaved?.flexy || {}) },
    whatsapp: whatsapp || paySaved?.whatsapp || DEFAULT_PAYMENT_SETTINGS.whatsapp,
  };

  if (flexyPhone) {
    parsed.flexy.phone = flexyPhone;
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
      whatsapp: String(body.whatsapp || DEFAULT_PAYMENT_SETTINGS.whatsapp).trim(),
      defaultMarginPercent: Math.max(1, Math.min(100, Number(body.defaultMarginPercent ?? DEFAULT_PAYMENT_SETTINGS.defaultMarginPercent))),
    };

    // 1. Save payment_accounts
    await saveSiteSetting('payment_accounts', settingsPayload);

    // 2. Also keep flexy_phone in sync
    await saveSiteSetting('flexy_phone', settingsPayload.flexy.phone);

    // 3. Keep whatsapp in sync
    if (settingsPayload.whatsapp) {
      await saveSiteSetting('whatsapp', settingsPayload.whatsapp);
    }

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
