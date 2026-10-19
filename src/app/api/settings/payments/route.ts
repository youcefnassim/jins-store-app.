import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

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
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['payment_accounts', 'flexy_phone', 'whatsapp']);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ settings: DEFAULT_PAYMENT_SETTINGS, ...DEFAULT_PAYMENT_SETTINGS });
    }

    const payRow = data.find(d => d.key === 'payment_accounts');
    const flexyRow = data.find(d => d.key === 'flexy_phone');
    const waRow = data.find(d => d.key === 'whatsapp');

    let parsed = { ...DEFAULT_PAYMENT_SETTINGS };
    if (payRow?.value) {
      const val = typeof payRow.value === 'string' ? JSON.parse(payRow.value) : payRow.value;
      parsed = {
        ...DEFAULT_PAYMENT_SETTINGS,
        ...val,
        baridimob: { ...DEFAULT_PAYMENT_SETTINGS.baridimob, ...(val.baridimob || {}) },
        ccp: { ...DEFAULT_PAYMENT_SETTINGS.ccp, ...(val.ccp || {}) },
        redotpay: { ...DEFAULT_PAYMENT_SETTINGS.redotpay, ...(val.redotpay || {}) },
        flexy: { ...DEFAULT_PAYMENT_SETTINGS.flexy, ...(val.flexy || {}) },
        whatsapp: val.whatsapp || DEFAULT_PAYMENT_SETTINGS.whatsapp,
      };
    }

    // If flexy_phone exists specifically, prioritize it
    if (flexyRow?.value) {
      const fPhone = typeof flexyRow.value === 'string' ? flexyRow.value : String(flexyRow.value?.phone || '');
      if (fPhone) {
        parsed.flexy.phone = fPhone;
      }
    }

    if (waRow?.value) {
      const waVal = typeof waRow.value === 'string' ? waRow.value : String(waRow.value?.phone || '');
      if (waVal) {
        parsed.whatsapp = waVal;
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
