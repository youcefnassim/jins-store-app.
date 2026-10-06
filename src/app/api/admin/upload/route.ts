import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const getAdminSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, serviceKey);
};

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const adminSupabase = getAdminSupabase();
    
    const { error: uploadError } = await adminSupabase.storage
      .from('banners')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: `Erreur d'upload: ${uploadError.message}. Assurez-vous que le bucket "banners" existe et est public.` }, { status: 500 });
    }

    const { data: { publicUrl } } = adminSupabase.storage
      .from('banners')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
