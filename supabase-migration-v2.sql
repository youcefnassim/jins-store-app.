-- ============================================================
-- Migration: Add missing columns to orders table
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add zone_id column (MLBB Zone ID, separate from player_id)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS zone_id TEXT;

-- Add phone column (Algerian phone number for follow-up)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add payment_method column (BaridiMob, CCP, Binance, Flexy...)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add promo_code column (code promo utilisé)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- ============================================================
-- Also ensure game_packages table has a "popular" column
-- ============================================================
ALTER TABLE game_packages ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;

-- Mark popular packages (example: 3rd package per game)
UPDATE game_packages SET popular = true WHERE label IN ('344 Diamants', '530 Diamonds', '660 UC', '2050 VP');

-- ============================================================
-- Row Level Security: allow users to read their own orders
-- (without joining profiles — just by order id)
-- ============================================================

-- Allow public to SELECT an order if they know its UUID (for tracking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow public order tracking by id'
  ) THEN
    CREATE POLICY "Allow public order tracking by id"
      ON orders FOR SELECT
      USING (true);
  END IF;
END $$;

-- Allow authenticated users to insert their own orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can create their own orders'
  ) THEN
    CREATE POLICY "Users can create their own orders"
      ON orders FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
