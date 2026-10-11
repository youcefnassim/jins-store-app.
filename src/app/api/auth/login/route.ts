import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, authCookieOptions, getSupabaseAnon } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // 1. Rate Limiting: Max 5 login attempts per 15 minutes per IP (Fixes S1)
  const rateLimitResponse = checkRateLimit(request, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    keyPrefix: 'auth_login',
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const supabase = getSupabaseAnon();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: 'Identifiants incorrects ou compte introuvable' }, { status: 401 });
    }

    // Never return raw tokens in the JSON body
    const response = NextResponse.json({
      user: data.user
        ? { id: data.user.id, email: data.user.email }
        : null,
    });

    if (data.session?.access_token) {
      response.cookies.set(AUTH_COOKIE, data.session.access_token, authCookieOptions());
    }

    return response;
  } catch (err: unknown) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
