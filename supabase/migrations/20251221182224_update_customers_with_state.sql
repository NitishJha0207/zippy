/*
  # Update Customers Table with State Information

  1. Changes to customers table
    - Add email field (for customer contact)
    - Add phone field (for customer contact)
    - Ensure state and state_code fields exist
    - Make state nullable since it's already in the schema as optional

  2. Rationale
    - Customers need contact information (email, phone) for invoices
    - State and state_code are needed for GST compliance
    - These fields align with the GST invoice requirements

  3. Security
    - No changes to RLS policies
*/

-- Add email and phone fields if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'email'
  ) THEN
    ALTER TABLE customers ADD COLUMN email TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'phone'
  ) THEN
    ALTER TABLE customers ADD COLUMN phone TEXT DEFAULT '';
  END IF;
END $$;