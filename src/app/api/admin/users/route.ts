import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, getSupabaseAdmin, mapProfile } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/supabase/audit';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('profiles')
      .select('id, full_name, email, role, points, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return NextResponse.json({ error: 'Impossible de charger les utilisateurs' }, { status: 500 });
    }

    const users = (data || []).map((row) => {
      const mapped = mapProfile(row)!;
      return {
        id: row.id,
        username: mapped.name,
        name: mapped.name,
        email: mapped.email,
        role: mapped.role,
        points: mapped.points,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({ users });
  } catch (err: unknown) {
    console.error('Unexpected admin users GET error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await request.json();
    const { userId, role } = body;
    if (!userId || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // Prevent accidental self-demotion lockout
    if (auth.user?.id === userId && role !== 'admin') {
      return NextResponse.json(
        { error: 'Action interdite : vous ne pouvez pas révoquer votre propre rôle administrateur.' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: 'Échec de la modification du rôle' }, { status: 500 });
    }

    await logAdminAction({
      adminId: auth.user!.id,
      adminEmail: auth.user!.email || 'admin',
      action: 'UPDATE_USER_ROLE',
      targetType: 'profiles',
      targetId: userId,
      details: { newRole: role },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Unexpected admin users PATCH error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
