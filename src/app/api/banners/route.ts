import { NextResponse } from 'next/server';
import { getSupabaseAnon } from '@/lib/supabase/server';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = getSupabaseAnon();
    
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
      
    if (error) {
      if (error.code === '42P01' || (error.message && error.message.toLowerCase().includes('schema cache'))) {
        return NextResponse.json({ banners: [] });
      }
      console.error('Banners fetch error:', error);
      return NextResponse.json({ banners: [] });
    }

    return NextResponse.json({ banners: banners || [] });
  } catch (err: unknown) {
    console.error('Unexpected banners error:', err);
    return NextResponse.json({ banners: [] });
  }
}
