import { NextResponse } from 'next/server';
import { AUTH_COOKIE, ADMIN_SESSION_COOKIE, REFRESH_COOKIE } from '@/lib/supabase/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  const clearOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };
  response.cookies.set(AUTH_COOKIE, '', clearOptions);
  response.cookies.set(ADMIN_SESSION_COOKIE, '', clearOptions);
  response.cookies.set(REFRESH_COOKIE, '', clearOptions);
  return response;
}
