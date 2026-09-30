-- ============================================================
-- SEED + TABLES MANQUANTES — Exécute dans SQL Editor
-- ============================================================

-- 1. Tables manquantes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL,
  current_uses INTEGER DEFAULT 0,
  max_uses INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Seed: Jeux
INSERT INTO games (id, name, slug, emoji, active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Mobile Legends: Bang Bang', 'mobile-legends', '💎', true),
  ('22222222-2222-2222-2222-222222222222', 'Free Fire', 'free-fire', '🔥', true),
  ('33333333-3333-3333-3333-333333333333', 'PUBG Mobile', 'pubg-mobile', '🎯', true),
  ('44444444-4444-4444-4444-444444444444', 'Valorant', 'valorant', '⚡', true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Seed: Packages Mobile Legends
INSERT INTO game_packages (game_id, label, price, popular) VALUES
  ('11111111-1111-1111-1111-111111111111', '86 Diamants', 190, false),
  ('11111111-1111-1111-1111-111111111111', '172 Diamants', 370, false),
  ('11111111-1111-1111-1111-111111111111', '344 Diamants', 720, true),
  ('11111111-1111-1111-1111-111111111111', '514 Diamants', 1050, false),
  ('11111111-1111-1111-1111-111111111111', '706 Diamants', 1420, false),
  ('11111111-1111-1111-1111-111111111111', '1060 Diamants', 2120, false);

-- 4. Seed: Packages Free Fire
INSERT INTO game_packages (game_id, label, price, popular) VALUES
  ('22222222-2222-2222-2222-222222222222', '140 Diamonds', 200, false),
  ('22222222-2222-2222-2222-222222222222', '355 Diamonds', 480, false),
  ('22222222-2222-2222-2222-222222222222', '530 Diamonds', 700, true),
  ('22222222-2222-2222-2222-222222222222', '1080 Diamonds', 1380, false),
  ('22222222-2222-2222-2222-222222222222', '2200 Diamonds', 2700, false);

-- 5. Seed: Packages PUBG Mobile
INSERT INTO game_packages (game_id, label, price, popular) VALUES
  ('33333333-3333-3333-3333-333333333333', '60 UC', 120, false),
  ('33333333-3333-3333-3333-333333333333', '325 UC', 600, false),
  ('33333333-3333-3333-3333-333333333333', '660 UC', 1180, true),
  ('33333333-3333-3333-3333-333333333333', '1800 UC', 3100, false);

-- 6. Seed: Packages Valorant
INSERT INTO game_packages (game_id, label, price, popular) VALUES
  ('44444444-4444-4444-4444-444444444444', '475 VP', 450, false),
  ('44444444-4444-4444-4444-444444444444', '1000 VP', 900, false),
  ('44444444-4444-4444-4444-444444444444', '2050 VP', 1800, true),
  ('44444444-4444-4444-4444-444444444444', '3650 VP', 3150, false);

-- 7. Seed: Codes Promo
INSERT INTO promo_codes (code, discount_percentage, current_uses, max_uses, active) VALUES
  ('BIENVENUE10', 10, 0, 100, true),
  ('ETE2026', 15, 0, 50, true)
ON CONFLICT (code) DO NOTHING;

-- 8. Seed: Avis clients (exemples)
INSERT INTO reviews (author_name, rating, comment, approved) VALUES
  ('Ahmed B.', 5, 'Service rapide et fiable ! Mes diamants en moins de 10 minutes.', true),
  ('Sara K.', 5, 'Super service, je recommande à tout le monde !', true),
  ('Yacine M.', 4, 'Très bon service, livraison rapide.', true);

-- 9. RLS pour les nouvelles tables
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read promos" ON promo_codes FOR SELECT USING (true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Users submit reviews" ON reviews FOR INSERT WITH CHECK (true);

-- 10. Bucket storage pour les reçus
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Policy storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can upload receipts'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can upload receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''receipts'')';
    EXECUTE 'CREATE POLICY "Public can view receipts" ON storage.objects FOR SELECT USING (bucket_id = ''receipts'')';
  END IF;
END $$;

-- Vérification finale
SELECT 'games' as table_name, COUNT(*) as records FROM games
UNION ALL
SELECT 'game_packages', COUNT(*) FROM game_packages
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'promo_codes', COUNT(*) FROM promo_codes
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews;
