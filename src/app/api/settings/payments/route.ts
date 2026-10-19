import { NextResponse } from 'next/server';
import { getSiteSetting } from '@/lib/settingsStore';

export interface PaymentAccountsSettings {
  baridimob: {
    rip: string;
    holder: string;
  };
  ccp: {
    account: string;
    cle: string;
    holder: string;
  };
  redotpay: {
    id: string;
  };
  flexy: {
    phone: string;
    feePercent: number;
  };
  whatsapp?: string;
  defaultMarginPercent: number;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentAccountsSettings = {
  baridimob: {
    rip: "00799999000000000012",
    holder: "JIN'S STORE",
  },
  ccp: {
    account: "12345678",
    cle: "99",
    holder: "JIN'S STORE",
  },
  redotpay: {
    id: "123456789",
  },
  flexy: {
    phone: "0550000000",
    feePercent: 20,
  },
  whatsapp: "+213550000000",
  defaultMarginPercent: 18,
};

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

