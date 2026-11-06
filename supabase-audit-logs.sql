-- ============================================================
-- Audit Logs Table Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  admin_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_email  TEXT NOT NULL DEFAULT '',
  action       TEXT NOT NULL,
  target_type  TEXT,
  target_id    TEXT,
  details      JSONB DEFAULT '{}'::jsonb,
  ip_address   TEXT,
  user_agent   TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at   ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id     ON public.audit_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action       ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type  ON public.audit_logs (target_type);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can write (server-side only)
DROP POLICY IF EXISTS "Service role insert audit_logs" ON public.audit_logs;
CREATE POLICY "Service role insert audit_logs"
  ON public.audit_logs FOR INSERT
  USING (auth.role() = 'service_role');

-- Admins can read their own logs
DROP POLICY IF EXISTS "Admins read audit_logs" ON public.audit_logs;
CREATE POLICY "Admins read audit_logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Grant to service role
GRANT ALL ON public.audit_logs TO service_role;
GRANT SELECT ON public.audit_logs TO authenticated;
