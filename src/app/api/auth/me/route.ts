import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = 'https://urpgragqoaodncenylmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGdyYWdxb2FvZG5jZW55bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjI3MTgsImV4cCI6MjEwNTEzODcxOH0.ObcE8IX3EHuMs-SehX5IV2fXjtsmPcyxOWahvtt6INs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('sb-access-token')?.value;
    if (!token) {
      return NextResponse.json({ user: null, profile: null });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ user: null, profile: null, debug_error: error });
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('role, points, name, email')
      .eq('id', user.id)
      .single();

    const isAdminEmail = user.email === 'youcefnassim60@gmail.com' || user.email === 'contact@jins-store.com' || user.email?.includes('admin');

    if (!profile || (isAdminEmail && profile?.role !== 'admin')) {
      const newRole = isAdminEmail ? 'admin' : (profile?.role || 'user');
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          role: newRole,
          points: profile?.points || 0,
        })
        .select()
        .single();

      if (updatedProfile) {
        profile = updatedProfile;
      } else {
        profile = { role: newRole, points: 0, email: user.email, name: '' };
      }
    }

    return NextResponse.json({ user, profile });
  } catch (err: any) {
    return NextResponse.json({ user: null, profile: null, catch_error: err.message });
  }
}
