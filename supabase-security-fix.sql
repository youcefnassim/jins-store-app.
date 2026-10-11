-- ============================================================
-- SECURITY + SCHEMA FIX — run in Supabase SQL Editor
-- After deploying the app code that expects these columns.
-- ============================================================

-- 1) Missing columns on games
ALTER TABLE games ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Jeux';
ALTER TABLE games ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2) Loyalty / double-award guard
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN DEFAULT false;

-- 3) Profiles: ensure full_name exists; copy legacy name/username if present
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) THEN
    EXECUTE 'UPDATE profiles SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    EXECUTE 'UPDATE profiles SET full_name = username WHERE full_name IS NULL AND username IS NOT NULL';
  END IF;
END $$;

-- 4) Reviews: ensure author_name; copy legacy name
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS game TEXT;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'name'
  ) THEN
    EXECUTE 'UPDATE reviews SET author_name = name WHERE author_name IS NULL AND name IS NOT NULL';
  END IF;
END $$;

-- 5) Banners table
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  image TEXT,
  link TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read banners" ON banners;
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (true);

-- 6) Site settings (marquee, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- No public policies: only service role / admin API should read-write.
-- Public marquee is served via Next.js API using service role.

-- 7) Harden orders SELECT — drop public full-table read
DROP POLICY IF EXISTS "Public order tracking" ON orders;
DROP POLICY IF EXISTS "Allow public order tracking by id" ON orders;
DROP POLICY IF EXISTS "Users read own orders" ON orders;
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Tracking by UUID is done via /api/orders/track (service role), not public RLS.

-- 8) Prevent clients from escalating role / inventing points
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- service_role bypasses RLS but still hits triggers; allow when JWT role is service_role
  IF coalesce(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.role := OLD.role;
    NEW.points := OLD.points;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := coalesce(NEW.role, 'user');
    IF NEW.role IS DISTINCT FROM 'user' THEN
      NEW.role := 'user';
    END IF;
    NEW.points := coalesce(NEW.points, 0);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_sensitive_fields ON profiles;
CREATE TRIGGER protect_profile_sensitive_fields
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_sensitive_fields();

-- 9) Receipts storage: require auth to upload (path should be user id)
DROP POLICY IF EXISTS "Anyone can upload receipts" ON storage.objects;
CREATE POLICY "Authenticated upload receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Keep public read only if you still need public receipt URLs for admin UI;
-- prefer authenticated/admin access in production. For now keep view public
-- but consider making the bucket private later.
DROP POLICY IF EXISTS "Public can view receipts" ON storage.objects;
CREATE POLICY "Public can view receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts');

-- 10) Banners storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read banner images" ON storage.objects;
CREATE POLICY "Public read banner images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

-- Admin uploads go through service role (bypasses RLS).
