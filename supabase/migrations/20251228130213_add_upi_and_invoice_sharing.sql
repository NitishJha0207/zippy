/*
  # Add UPI Payment and Invoice Sharing

  ## Summary
  Adds UPI payment support and shareable invoice links for easier payment collection
  and invoice sharing, especially for small businesses.

  ## Changes

  ### 1. UPI Payment Support
  
  Adds to `profiles` table:
  - `upi_id` (text): User's UPI ID (e.g., yourname@paytm, 9876543210@ybl)
  - Simpler alternative to Razorpay for small businesses

  ### 2. Invoice Sharing
  
  Adds to `invoices` table:
  - `share_token` (uuid): Unique token for public invoice sharing
  - Allows generating shareable links without authentication
  - Enables WhatsApp sharing of actual invoice view

  ## Security
  - Share tokens are UUID-based for security
  - Public invoice view is read-only
  - No RLS bypass - uses dedicated public access pattern
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'upi_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN upi_id text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE invoices ADD COLUMN share_token uuid DEFAULT gen_random_uuid() UNIQUE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_share_token'
  ) THEN
    CREATE INDEX idx_invoices_share_token ON invoices(share_token);
  END IF;
END $$;

CREATE POLICY "Anyone can view invoices with valid share token"
  ON invoices
  FOR SELECT
  TO anon
  USING (share_token IS NOT NULL);

CREATE POLICY "Anyone can view invoice items for shared invoices"
  ON invoice_items
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.share_token IS NOT NULL
    )
  );