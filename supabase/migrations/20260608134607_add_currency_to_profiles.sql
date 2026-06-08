-- Add currency preference to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR';
