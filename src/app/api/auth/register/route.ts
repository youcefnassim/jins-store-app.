import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  'https://urpgragqoaodncenylmn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGdyYWdxb2FvZG5jZW55bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjI3MTgsImV4cCI6MjEwNTEzODcxOH0.ObcE8IX3EHuMs-SehX5IV2fXjtsmPcyxOWahvtt6INs'
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // 1. Create user in Supabase Auth
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

    // 2. If user created, insert profile row with name + role
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        name: name || '',
        role: 'user',
        points: 0,
      });

      // 3. Auto sign-in after register
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError && signInData.session) {
        const response = NextResponse.json({ user: signInData.user, session: signInData.session });
        response.cookies.set('sb-access-token', signInData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });
        return response;
      }
    }

    const response = NextResponse.json({ user: data.user, session: data.session });

    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
