import { NextResponse } from 'next/server';
import { getSiteSetting } from '@/lib/settingsStore';
import { PaymentAccountsSettings, DEFAULT_PAYMENT_SETTINGS } from '@/lib/payment-settings';

export type { PaymentAccountsSettings };
export { DEFAULT_PAYMENT_SETTINGS };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
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

    return NextResponse.json({
      settings: parsed,
      ...parsed,
    });
  } catch (err) {
    console.error('Failed to load payment settings:', err);
    return NextResponse.json({
      settings: DEFAULT_PAYMENT_SETTINGS,
      ...DEFAULT_PAYMENT_SETTINGS,
    });
  }
}

