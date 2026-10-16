import { NextResponse } from 'next/server';
import { getSupabaseAnon } from '@/lib/supabase/server';

const DEFAULT_FLEXY_PHONE = "0550000000";

export const revalidate = 30; // 30s cache

export async function GET() {
  try {
    const supabase = getSupabaseAnon();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'flexy_phone')
      .maybeSingle();

    if (error || !data?.value) {
      return NextResponse.json({ flexyPhone: DEFAULT_FLEXY_PHONE });
    }

    const phone = typeof data.value === 'string' 
      ? data.value 
      : String((data.value as any)?.phone || DEFAULT_FLEXY_PHONE);

    return NextResponse.json({ flexyPhone: phone });
  } catch {
    return NextResponse.json({ flexyPhone: DEFAULT_FLEXY_PHONE });
  }
}
