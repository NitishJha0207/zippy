-- Make GSTIN optional for early-stage businesses
-- 
-- Changes:
-- 1. Make profiles.gstin nullable
-- 2. Make customers.gstin nullable (already done)
-- 3. Make invoice party GSTIN fields nullable (already done)

-- Update profiles table to allow NULL GSTIN
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'gstin' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN gstin DROP NOT NULL;
  END IF;
END $$;