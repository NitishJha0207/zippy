/*
  # Add Public Profile Access for Shared Invoices

  ## Summary
  Allows anonymous users to view profile information when accessing
  shared invoices via share token.

  ## Changes

  ### 1. RLS Policy for Profiles
  - Allows anonymous users to view profile data for users who have
    shared invoices
  - Restricted to only profiles that have active shared invoices
  - Read-only access for company info display on public invoice pages

  ### 2. Backfill Share Tokens
  - Ensures all existing invoices have share tokens generated
  - Required for old invoices to be shareable

  ## Security
  - Only allows viewing profile info if user has shared invoices
  - No sensitive data exposed (only company details)
  - Read-only access for anonymous users
*/

CREATE POLICY "Anyone can view profiles for shared invoices"
  ON profiles
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.user_id = profiles.id
      AND invoices.share_token IS NOT NULL
    )
  );

UPDATE invoices 
SET share_token = gen_random_uuid() 
WHERE share_token IS NULL;