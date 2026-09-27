-- Add points to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Optional: Create a function to award points that can be called from server side
CREATE OR REPLACE FUNCTION award_points(user_uuid UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET points = COALESCE(points, 0) + amount
  WHERE id = user_uuid;
END;
$$;
