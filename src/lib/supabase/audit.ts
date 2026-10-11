import { getSupabaseAdmin } from './server';

export interface AuditLogItem {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: Record<string, unknown> | string;
  created_at: string;
}

// In-memory fallback ring buffer of recent logs in case DB table is not yet migrated
const memoryLogs: AuditLogItem[] = [];
const MAX_MEMORY_LOGS = 100;

export async function logAdminAction(params: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, unknown> | string;
}) {
  const item: AuditLogItem = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    admin_id: params.adminId,
    admin_email: params.adminEmail,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId,
    details: params.details,
    created_at: new Date().toISOString(),
  };

  // Add to memory buffer
  memoryLogs.unshift(item);
  if (memoryLogs.length > MAX_MEMORY_LOGS) {
    memoryLogs.pop();
  }

  // Attempt to write to Supabase audit_logs table
  try {
    const admin = getSupabaseAdmin();
    await admin.from('audit_logs').insert([
      {
        admin_id: params.adminId,
        admin_email: params.adminEmail,
        action: params.action,
        target_type: params.targetType,
        target_id: params.targetId || null,
        details: typeof params.details === 'object' ? JSON.stringify(params.details) : params.details || null,
        created_at: item.created_at,
      },
    ]);
  } catch (err) {
    // Graceful fallback to console & memory buffer if table doesn't exist
    console.info(`[AUDIT LOG] ${params.adminEmail} | ${params.action} on ${params.targetType}:`, params.details);
  }
}

export async function getRecentAuditLogs(limit = 50): Promise<AuditLogItem[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return memoryLogs.slice(0, limit);
    }

    return data.map((d: any) => ({
      id: d.id,
      admin_id: d.admin_id,
      admin_email: d.admin_email,
      action: d.action,
      target_type: d.target_type,
      target_id: d.target_id,
      details: typeof d.details === 'string' ? (() => { try { return JSON.parse(d.details); } catch { return d.details; } })() : d.details,
      created_at: d.created_at,
    }));
  } catch {
    return memoryLogs.slice(0, limit);
  }
}
