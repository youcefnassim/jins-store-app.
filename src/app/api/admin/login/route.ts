import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, authCookieOptions, getSupabaseAnon, getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const MASTER_PASSWORD = process.env.ADMIN_MASTER_PASSWORD || 'JinStore2026!';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    const supabaseAnon = getSupabaseAnon();
    const supabaseAdmin = getSupabaseAdmin();

    const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'ramziotaku1@gmail.com,youcefnassim60@gmail.com,admin@jins-store.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const isEnvAdmin = adminEmails.includes(cleanEmail);

    let userId: string = 'admin-master';
    let userEmail: string = cleanEmail;
    let token: string | null = null;

    // A. Check if Master Password is used for a configured admin
    if (cleanPassword === MASTER_PASSWORD && isEnvAdmin) {
      token = `admin-master:${cleanEmail}`;
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('email', cleanEmail)
        .single();

      if (profile) {
        userId = profile.id;
        if (profile.role !== 'admin') {
          try {
            await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', profile.id);
          } catch (e) {
            console.warn('Could not update role:', e);
          }
        }
      }
    } else {
      // B. Authenticate user via standard Supabase Auth
      const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError || !authData.user) {
        return NextResponse.json(
          { error: 'Identifiants administrateur incorrects.' },
          { status: 401 }
        );
      }

      const user = authData.user;
      userId = user.id;
      userEmail = user.email || cleanEmail;
      token = authData.session?.access_token || null;

      // Check admin role
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

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
    }

    // 3. Set secure auth cookie
    const response = NextResponse.json({
      success: true,
      user: { id: userId, email: userEmail },
      role: 'admin',
    });

    if (token) {
      response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    }

    return response;
  } catch (err: unknown) {
    console.error('Admin login API error:', err);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
