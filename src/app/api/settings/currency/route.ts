import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('site_settings')
      .select('value')
      .eq('key', 'currency_rates')
      .maybeSingle();

    if (data?.value) {
      const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      return NextResponse.json({
        rates: {
          DZD: 1,
          USD: Number(val.USD) || 242,
          EUR: Number(val.EUR) || 275,
        }
      });
    }

    return NextResponse.json({
      rates: { DZD: 1, USD: 242, EUR: 275 }
    });
  } catch {
    return NextResponse.json({
      rates: { DZD: 1, USD: 242, EUR: 275 }
    });
  }
}
