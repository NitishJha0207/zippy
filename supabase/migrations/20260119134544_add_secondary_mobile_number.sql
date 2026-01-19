/*
  # Add Secondary Mobile Number to Profiles

  1. Changes
    - Add `secondary_mobile_number` column to `profiles` table
    - This field is optional and allows companies to provide a second contact number
  
  2. Notes
    - Field is nullable to maintain backward compatibility
    - No default value as this is truly optional information
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'secondary_mobile_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN secondary_mobile_number TEXT;
  END IF;
END $$;
