import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const getAdminSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, serviceKey);
};

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const adminSupabase = getAdminSupabase();
    
    // Test if banners table exists
    const { data: banners, error } = await adminSupabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
      
    if (error) {
      if (error.code === '42P01') {
        // relation "banners" does not exist -> return empty array without crashing
        return NextResponse.json({ banners: [], table_missing: true });
      }
      throw error;
    }

    return NextResponse.json({ banners, table_missing: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { title, description, image, link, color, sort_order } = await request.json();

    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('banners')
      .insert([{ title, description, image, link, color, sort_order }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ banner: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { id, title, description, image, link, color, sort_order } = await request.json();

    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('banners')
      .update({ title, description, image, link, color, sort_order })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ banner: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const adminSupabase = getAdminSupabase();
    const { error } = await adminSupabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
