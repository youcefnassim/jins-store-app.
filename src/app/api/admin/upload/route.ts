import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin } from '@/lib/supabase/server';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }
    const fileExt = MIME_TO_EXT[file.type];
    if (!fileExt) {
      return NextResponse.json({ error: 'Type de fichier non autorisé (JPEG, PNG, WebP ou GIF)' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const admin = getSupabaseAdmin();
    const { error: uploadError } = await admin.storage.from('banners').upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: "Erreur de stockage de l'image. Veuillez vérifier la configuration du bucket." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = admin.storage.from('banners').getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    console.error('Unexpected admin upload error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
