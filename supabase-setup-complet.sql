-- ============================================================
-- SETUP COMPLET : Créer toutes les tables manquantes
-- Exécute ce fichier EN PREMIER dans Supabase SQL Editor
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: profiles (liée à auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Table: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  game TEXT NOT NULL,
  package TEXT NOT NULL,
  player_id TEXT NOT NULL,
  zone_id TEXT,
  phone TEXT,
  payment_method TEXT,
  price TEXT NOT NULL,
  points_to_award INTEGER DEFAULT 0,
  receipt_url TEXT,
  promo_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- Table: games
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- Table: game_packages
-- ============================================================
CREATE TABLE IF NOT EXISTS game_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  price INTEGER NOT NULL,
  popular BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- Table: promo_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 1 AND discount_percentage <= 100),
  current_uses INTEGER DEFAULT 0,
  max_uses INTEGER NOT NULL CHECK (max_uses >= 1),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- Table: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- Table: saved_accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  player_id TEXT NOT NULL,
  zone_id TEXT,
  player_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- Seed: Default Games
-- ============================================================
INSERT INTO games (id, name, slug, emoji, active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Mobile Legends: Bang Bang', 'mobile-legends', '💎', true),
  ('22222222-2222-2222-2222-222222222222', 'Free Fire', 'free-fire', '🔥', true),
  ('33333333-3333-3333-3333-333333333333', 'PUBG Mobile', 'pubg-mobile', '🎯', true),
  ('44444444-4444-4444-4444-444444444444', 'Valorant', 'valorant', '⚡', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed: Packages Mobile Legends
-- ============================================================
INSERT INTO game_packages (game_id, label, price, popular) VALUES
  ('11111111-1111-1111-1111-111111111111', '86 Diamants', 190, false),
  ('11111111-1111-1111-1111-111111111111', '172 Diamants', 370, false),
  ('11111111-1111-1111-1111-111111111111', '344 Diamants', 720, true),
  ('11111111-1111-1111-1111-111111111111', '514 Diamants', 1050, false),
  ('11111111-1111-1111-1111-111111111111', '706 Diamants', 1420, false),
  ('11111111-1111-1111-1111-111111111111', '1060 Diamants', 2120, false)
ON CONFLICT DO NOTHING;

-- Packages Free Fire
INSERT INTO game_packages (game_id, label, price, popular) VALUES
  ('22222222-2222-2222-2222-222222222222', '140 Diamonds', 200, false),
  ('22222222-2222-2222-2222-222222222222', '355 Diamonds', 480, false),
  ('22222222-2222-2222-2222-222222222222', '530 Diamonds', 700, true),
  ('22222222-2222-2222-2222-222222222222', '1080 Diamonds', 1380, false),
  ('22222222-2222-2222-2222-222222222222', '2200 Diamonds', 2700, false)
ON CONFLICT DO NOTHING;

-- Packages PUBG Mobile
INSERT INTO game_packages (game_id, label, price, popular) VALUES
  ('33333333-3333-3333-3333-333333333333', '60 UC', 120, false),
  ('33333333-3333-3333-3333-333333333333', '325 UC', 600, false),
  ('33333333-3333-3333-3333-333333333333', '660 UC', 1180, true),
  ('33333333-3333-3333-3333-333333333333', '1800 UC', 3100, false)
ON CONFLICT DO NOTHING;

-- Packages Valorant
INSERT INTO game_packages (game_id, label, price, popular) VALUES
  ('44444444-4444-4444-4444-444444444444', '475 VP', 450, false),
  ('44444444-4444-4444-4444-444444444444', '1000 VP', 900, false),
  ('44444444-4444-4444-4444-444444444444', '2050 VP', 1800, true),
  ('44444444-4444-4444-4444-444444444444', '3650 VP', 3150, false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Promo Codes
-- ============================================================
INSERT INTO promo_codes (code, discount_percentage, current_uses, max_uses, active) VALUES
  ('BIENVENUE10', 10, 0, 100, true),
  ('ETE2026', 15, 0, 50, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_accounts ENABLE ROW LEVEL SECURITY;

-- Profiles: users read/update their own
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: public can read by ID (tracking), users create their own
CREATE POLICY "Public order tracking" ON orders FOR SELECT USING (true);
CREATE POLICY "Users create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Games: public read
CREATE POLICY "Public read games" ON games FOR SELECT USING (true);
CREATE POLICY "Public read packages" ON game_packages FOR SELECT USING (true);

-- Promos: public read
CREATE POLICY "Public read promos" ON promo_codes FOR SELECT USING (true);

-- Reviews: public read approved, users insert own
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Users submit reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saved accounts: users manage their own
CREATE POLICY "Users read own accounts" ON saved_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own accounts" ON saved_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own accounts" ON saved_accounts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Storage Bucket: receipts (for payment proof uploads)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Public can view receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');
