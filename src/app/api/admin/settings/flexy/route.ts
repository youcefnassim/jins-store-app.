import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';
import { getSiteSetting, saveSiteSetting } from '@/lib/settingsStore';

const DEFAULT_FLEXY_PHONE = "0550000000";

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const flexyPhone = await getSiteSetting<string>('flexy_phone', DEFAULT_FLEXY_PHONE);
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

    await saveSiteSetting('flexy_phone', flexyPhone);

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

