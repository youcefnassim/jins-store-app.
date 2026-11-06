-- ============================================================
-- CRITICAL SECURITY FIX: site_settings RLS
-- The current policy allows public writes to bank account data!
-- Run this in Supabase SQL Editor immediately.
-- ============================================================

-- Step 1: Revoke the dangerous public write policy
DROP POLICY IF EXISTS "Allow write site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow all site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_all" ON public.site_settings;

-- Step 2: Keep public read (settings need to be readable by the app)
DROP POLICY IF EXISTS "Allow read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Step 3: Only service role (server-side) can write
CREATE POLICY "Service role write site_settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Verify RLS is enabled
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Grant
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
