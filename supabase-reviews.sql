-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional, if they are logged in
  name TEXT NOT NULL,
  game TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default demo reviews so the site is not empty
INSERT INTO reviews (name, game, rating, comment, approved) VALUES 
('Yassine DZ', 'Mobile Legends', 5, 'The fastest recharge service in Algeria! I got my Mobile Legends diamonds in less than 5 minutes. Highly recommended.', true),
('Aminesniiper', 'Free Fire', 5, 'Trustworthy and very professional. The customer support helped me immediately when I made a mistake with my Zone ID.', true),
('Karim_16', 'PUBG Mobile', 5, 'First time buying here and I paid with BaridiMob. Everything went smooth and the interface is incredibly beautiful.', true),
('Sarah_Gamer', 'Valorant', 5, 'I love the new fidelity points system! Now I can get discounts on my weekly passes. The best store for MLBB.', true),
('Rami M.', 'PUBG Mobile', 4, 'Très bon service, les prix sont corrects mais un peu lent le soir.', false);

-- Add public read access for approved reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on approved reviews" 
ON reviews FOR SELECT USING (approved = true);

-- Allow authenticated users to insert reviews
CREATE POLICY "Enable insert for authenticated users only" 
ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (can do anything)
CREATE POLICY "Admins can do everything on reviews"
ON reviews FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
