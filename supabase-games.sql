-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create game_packages table for prices
CREATE TABLE IF NOT EXISTS game_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default games (run these sequentially)
INSERT INTO games (id, name, slug, emoji) VALUES 
('11111111-1111-1111-1111-111111111111', 'Mobile Legends: Bang Bang', 'mobile-legends', '💎'),
('22222222-2222-2222-2222-222222222222', 'Free Fire', 'free-fire', '🔥'),
('33333333-3333-3333-3333-333333333333', 'PUBG Mobile', 'pubg-mobile', '🎯'),
('44444444-4444-4444-4444-444444444444', 'Valorant', 'valorant', '⚡')
ON CONFLICT (slug) DO NOTHING;

-- Insert default packages for Mobile Legends
INSERT INTO game_packages (game_id, label, price) VALUES 
('11111111-1111-1111-1111-111111111111', '86 Diamants', 190),
('11111111-1111-1111-1111-111111111111', '172 Diamants', 370),
('11111111-1111-1111-1111-111111111111', '344 Diamants', 720),
('11111111-1111-1111-1111-111111111111', '514 Diamants', 1050),
('11111111-1111-1111-1111-111111111111', '706 Diamants', 1420),
('11111111-1111-1111-1111-111111111111', '1060 Diamants', 2120);

-- Insert default packages for Free Fire
INSERT INTO game_packages (game_id, label, price) VALUES 
('22222222-2222-2222-2222-222222222222', '140 Diamonds', 200),
('22222222-2222-2222-2222-222222222222', '355 Diamonds', 480),
('22222222-2222-2222-2222-222222222222', '530 Diamonds', 700),
('22222222-2222-2222-2222-222222222222', '1080 Diamonds', 1380),
('22222222-2222-2222-2222-222222222222', '2200 Diamonds', 2700);

-- Insert default packages for PUBG Mobile
INSERT INTO game_packages (game_id, label, price) VALUES 
('33333333-3333-3333-3333-333333333333', '60 UC', 120),
('33333333-3333-3333-3333-333333333333', '325 UC', 600),
('33333333-3333-3333-3333-333333333333', '660 UC', 1180),
('33333333-3333-3333-3333-333333333333', '1800 UC', 3100);

-- Insert default packages for Valorant
INSERT INTO game_packages (game_id, label, price) VALUES 
('44444444-4444-4444-4444-444444444444', '475 VP', 450),
('44444444-4444-4444-4444-444444444444', '1000 VP', 900),
('44444444-4444-4444-4444-444444444444', '2050 VP', 1800),
('44444444-4444-4444-4444-444444444444', '3650 VP', 3150);

-- Add public read access
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on games" ON games FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on game_packages" ON game_packages FOR SELECT USING (true);
