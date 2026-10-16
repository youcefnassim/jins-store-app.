import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';

const DEFAULT_FLEXY_PHONE = "0550000000";

async function loadFlexyPhone() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', 'flexy_phone')
    .maybeSingle();

  if (error || !data?.value) return DEFAULT_FLEXY_PHONE;
  return typeof data.value === 'string' 
    ? data.value 
    : String((data.value as any)?.phone || DEFAULT_FLEXY_PHONE);
}

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const flexyPhone = await loadFlexyPhone();
    return NextResponse.json({ flexyPhone });
  } catch {
    return NextResponse.json({ flexyPhone: DEFAULT_FLEXY_PHONE });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const flexyPhone = typeof body.flexyPhone === 'string' ? body.flexyPhone.trim() : '';

    if (!flexyPhone) {
      return NextResponse.json({ error: 'Numéro Flexy invalide' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('site_settings').upsert({
      key: 'flexy_phone',
      value: flexyPhone,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Flexy phone update error:', error);
      return NextResponse.json({ error: 'Échec de la mise à jour du numéro Flexy' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'UPDATE_FLEXY_PHONE',
      targetType: 'site_settings',
      details: { flexyPhone },
    });

    return NextResponse.json({ success: true, flexyPhone });
  } catch (err: unknown) {
    console.error('Admin flexy settings error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
