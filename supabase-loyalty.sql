-- Add jins_coins to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jins_coins INTEGER DEFAULT 0;

-- Optional: Create a function to award points that can be called from server side
CREATE OR REPLACE FUNCTION award_jins_coins(user_uuid UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET jins_coins = jins_coins + amount
  WHERE id = user_uuid;
END;
$$;
