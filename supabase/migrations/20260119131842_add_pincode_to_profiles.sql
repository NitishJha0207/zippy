/*
  # Add Pincode Field to Profiles

  1. Changes
    - Add `pincode` column to `profiles` table to store postal/zip code
    - This field is optional and can be null for existing users
  
  2. Notes
    - Existing profiles will have NULL pincode initially
    - Users can update their pincode through the profile settings
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pincode'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pincode text;
  END IF;
END $$;