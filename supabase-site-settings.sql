-- ============================================================
-- SCRIPT POUR CRÉER LA TABLE site_settings DANS SUPABASE
-- Copie et colle ce code dans Supabase > SQL Editor > Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Activer Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture et l'écriture sécurisée
DROP POLICY IF EXISTS "Allow read site_settings" ON public.site_settings;
CREATE POLICY "Allow read site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write site_settings" ON public.site_settings;
CREATE POLICY "Allow write site_settings" ON public.site_settings FOR ALL USING (true);

-- Insérer les valeurs de départ
INSERT INTO public.site_settings (key, value)
VALUES 
  ('flexy_phone', '"0776665110"'::jsonb),
  ('payment_accounts', '{"baridimob": {"rip": "00799999000000000012", "holder": "JIN''S STORE"}, "ccp": {"account": "12345678", "cle": "99", "holder": "JIN''S STORE"}, "redotpay": {"id": "123456789"}, "flexy": {"phone": "0776665110", "feePercent": 20}, "whatsapp": "+213550000000", "defaultMarginPercent": 18}'::jsonb),
  ('whatsapp', '"+213550000000"'::jsonb),
  ('currency_rates', '{"DZD": 1, "USD": 242, "EUR": 275}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- S'assurer que la table orders a toutes ses colonnes
-- ============================================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_to_award INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code TEXT;

