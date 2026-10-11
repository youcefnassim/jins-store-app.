import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, authCookieOptions } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Supabase non configuré' }, { status: 500 });
    }

    const supabase = createClient(url, anonKey);
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: name || '',
        role: 'user',
        points: 0,
      });

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError && signInData.session?.access_token) {
        const response = NextResponse.json({
          user: { id: signInData.user.id, email: signInData.user.email },
        });
        response.cookies.set(AUTH_COOKIE, signInData.session.access_token, authCookieOptions());
        return response;
      }
    }

    const response = NextResponse.json({
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    });

    if (data.session?.access_token) {
      response.cookies.set(AUTH_COOKIE, data.session.access_token, authCookieOptions());
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
