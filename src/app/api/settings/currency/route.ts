import { NextResponse } from 'next/server';
import { getSiteSetting } from '@/lib/settingsStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const val = await getSiteSetting<{ USD?: number; EUR?: number } | null>('currency_rates', null);
    if (val) {
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

