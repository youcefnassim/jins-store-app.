import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/supabase/server';
import { getRecentAuditLogs } from '@/lib/supabase/audit';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

    const logs = await getRecentAuditLogs(50);
    return NextResponse.json({ logs });
  } catch (err: unknown) {
    console.error('Error fetching admin logs:', err);
    return NextResponse.json({ error: 'Impossible de récupérer les journaux' }, { status: 500 });
  }
}
