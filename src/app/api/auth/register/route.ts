import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  'https://urpgraqgoaodncenylmn.supabase.co',
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
        return NextResponse.json({ user: signInData.user, session: signInData.session });
      }
    }

    return NextResponse.json({ user: data.user, session: data.session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
