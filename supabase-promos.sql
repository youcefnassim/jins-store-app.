-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 1 AND discount_percentage <= 100),
  current_uses INTEGER DEFAULT 0,
  max_uses INTEGER NOT NULL CHECK (max_uses >= 1),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default demo promos
INSERT INTO promo_codes (code, discount_percentage, current_uses, max_uses, active) VALUES 
('BIENVENUE10', 10, 0, 100, true),
('ETE2026', 15, 34, 50, true),
('MLBB5', 5, 50, 50, false);

-- Set up Row Level Security
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to validate promos
CREATE POLICY "Enable read access for all users" 
ON promo_codes FOR SELECT USING (true);

-- Admins can do everything
CREATE POLICY "Admins can manage promos"
ON promo_codes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
