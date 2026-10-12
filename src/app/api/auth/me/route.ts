import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, getSupabaseAnon, getSupabaseAdmin, mapProfile } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ user: null, profile: null });
    }

    const supabase = getSupabaseAnon();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    // Stale or expired token: delete cookie so state stays clean (Fixes S7)
    if (error || !user) {
      const response = NextResponse.json({ user: null, profile: null });
      response.cookies.delete(AUTH_COOKIE);
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

    const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'ramziotaku1@gmail.com,youcefnassim60@gmail.com,admin@jins-store.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const isConfiguredAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));

    if (isConfiguredAdmin && profile && profile.role !== 'admin') {
      profile.role = 'admin';
      try {
        await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      } catch {
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      }
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile,
    });
  } catch (err: unknown) {
    console.error('Error fetching current user:', err);
    return NextResponse.json({ user: null, profile: null });
  }
}
