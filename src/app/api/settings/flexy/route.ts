import { NextResponse } from 'next/server';
import { getSiteSetting } from '@/lib/settingsStore';

const DEFAULT_FLEXY_PHONE = "0550000000";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const flexyPhone = await getSiteSetting<string>('flexy_phone', DEFAULT_FLEXY_PHONE);
    return NextResponse.json({ flexyPhone });
  } catch {
    return NextResponse.json({ flexyPhone: DEFAULT_FLEXY_PHONE });
  }
}


