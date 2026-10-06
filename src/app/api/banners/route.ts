import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
      
    if (error) {
      if (error.code === '42P01' || (error.message && error.message.toLowerCase().includes('schema cache'))) {
        // relation "banners" does not exist -> return empty array
        return NextResponse.json({ banners: [] });
      }
      throw error;
    }

    return NextResponse.json({ banners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
