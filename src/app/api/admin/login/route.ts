import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, authCookieOptions, getSupabaseAnon, getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const supabaseAnon = getSupabaseAnon();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password),
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Identifiants administrateur incorrects.' },
        { status: 401 }
      );
    }

    const user = authData.user;

    // 2. Check admin role via service_role (bypasses any RLS issues)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'ramziotaku1@gmail.com,youcefnassim60@gmail.com,admin@jins-store.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const isEnvAdmin = adminEmails.includes(cleanEmail);

    // If matches ADMIN_EMAIL env or fallback list, ensure role is 'admin' in database
    if (isEnvAdmin && profile?.role !== 'admin') {
      try {
        await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      } catch (e) {
        console.warn('Could not update profile to admin:', e);
      }
    }

    if (profile?.role !== 'admin' && !isEnvAdmin) {
      return NextResponse.json(
        { error: "Accès refusé. Ce compte n'a pas les privilèges administrateur." },
        { status: 403 }
      );
    }

    // 3. Set secure auth cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      role: 'admin',
    });

    if (authData.session?.access_token) {
      response.cookies.set(AUTH_COOKIE, authData.session.access_token, authCookieOptions());
    }

    return response;
  } catch (err: unknown) {
    console.error('Admin login API error:', err);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
