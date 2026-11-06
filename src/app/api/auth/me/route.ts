import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE,
  ADMIN_SESSION_COOKIE,
  REFRESH_COOKIE,
  authCookieOptions,
  getSupabaseAnon,
  getSupabaseAdmin,
  mapProfile,
  resolveAdminUuid,
  verifyAdminToken,
} from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'ramziotaku1@gmail.com,youcefnassim60@gmail.com,admin@jins-store.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    // 1. Check for HMAC-signed admin session cookie
    const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (adminCookie) {
      const colonIdx = adminCookie.indexOf(':');
      if (colonIdx !== -1) {
        const email = adminCookie.slice(0, colonIdx).toLowerCase();
        const signature = adminCookie.slice(colonIdx + 1);
        if (email && signature && verifyAdminToken(signature, email) && adminEmails.includes(email)) {
          const realId = await resolveAdminUuid(email);
          return NextResponse.json({
            user: { id: realId, email },
            profile: {
              id: realId,
              email,
              name: 'Administrateur',
              full_name: 'Administrateur',
              role: 'admin',
              points: 9999,
            },
          });
        }
      }
    }

    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

    if (!token && !refreshToken) {
      return NextResponse.json({ user: null, profile: null });
    }

    const supabase = getSupabaseAnon();
    let user = null;
    let newAccessToken: string | null = null;
    let newRefreshToken: string | null = null;

    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    // If access token expired or missing, attempt refresh using refresh_token
    if (!user && refreshToken) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (!refreshError && refreshed.session?.user) {
        user = refreshed.session.user;
        newAccessToken = refreshed.session.access_token;
        newRefreshToken = refreshed.session.refresh_token;
      }
    }

    // If both failed, delete cookies and return null
    if (!user) {
      const response = NextResponse.json({ user: null, profile: null });
      response.cookies.delete(AUTH_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }

    const supabaseAdmin = getSupabaseAdmin();
    let profileRow = null;

    try {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('role, points, full_name, email')
        .eq('id', user.id)
        .single();
      profileRow = data;
    } catch {
      const { data } = await supabase
        .from('profiles')
        .select('role, points, full_name, email')
        .eq('id', user.id)
        .single();
      profileRow = data;
    }

    let profile = mapProfile(profileRow);

    if (!profile) {
      try {
        const { data: created } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            role: 'user',
            points: 0,
          })
          .select('role, points, full_name, email')
          .single();
        profile = mapProfile(created);
      } catch {
        const { data: created } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            role: 'user',
            points: 0,
          })
          .select('role, points, full_name, email')
          .single();
        profile = mapProfile(created);
      }
    }

    const isConfiguredAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));

    if (isConfiguredAdmin && profile && profile.role !== 'admin') {
      profile.role = 'admin';
      try {
        await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      } catch {
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      }
    }

    const response = NextResponse.json({
      user: { id: user.id, email: user.email },
      profile,
    });

    if (newAccessToken) {
      response.cookies.set(AUTH_COOKIE, newAccessToken, authCookieOptions());
    }
    if (newRefreshToken) {
      response.cookies.set(REFRESH_COOKIE, newRefreshToken, authCookieOptions(60 * 60 * 24 * 30));
    }

    return response;
  } catch (err: unknown) {
    console.error('Error fetching current user:', err);
    return NextResponse.json({ user: null, profile: null });
  }
}
