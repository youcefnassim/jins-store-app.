import { NextResponse } from 'next/server';
import { getSupabaseAnon } from '@/lib/supabase/server';

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
  defaultMarginPercent: 18,
};

export const revalidate = 30; // Cache 30s

export async function GET() {
  try {
    const supabase = getSupabaseAnon();
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['payment_accounts', 'flexy_phone']);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ settings: DEFAULT_PAYMENT_SETTINGS });
    }

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

    // If flexy_phone exists specifically, prioritize it
    if (flexyRow?.value) {
      const fPhone = typeof flexyRow.value === 'string' ? flexyRow.value : String(flexyRow.value?.phone || '');
      if (fPhone) {
        parsed.flexy.phone = fPhone;
      }
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
