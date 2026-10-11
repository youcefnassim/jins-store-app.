import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, authCookieOptions, getSupabaseAdmin, getSupabaseAnon } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  // Fallback to origin + next path
  const safeNext = next.startsWith('/') ? next : '/dashboard';
  const redirectUrl = new URL(safeNext, origin);

  if (code) {
    const supabase = getSupabaseAnon();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const user = data.session.user;
      const admin = getSupabaseAdmin();

      // Ensure profile row exists in public.profiles table
      try {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.custom_claims?.global_name ||
          user.email?.split('@')[0] ||
          '';

        await admin.from('profiles').upsert(
          {
            id: user.id,
            email: user.email || '',
            full_name: fullName,
            role: 'user',
            points: 0,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      } catch (profileErr) {
        console.error('Error creating profile for OAuth user:', profileErr);
      }

      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set(AUTH_COOKIE, data.session.access_token, authCookieOptions());
      return response;
    } else {
      console.error('OAuth token exchange error:', error);
    }
  }

  // In case of error or missing code, redirect back to login
  const fallbackUrl = new URL('/auth/login?error=oauth_failed', origin);
  return NextResponse.redirect(fallbackUrl);
}
