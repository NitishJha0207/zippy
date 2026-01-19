/*
  # Remove Barcode Functionality

  1. Changes
    - Drop `barcode` column from `products` table
    - Drop `barcode` column from `invoice_items` table
  
  2. Notes
    - Barcode generation and management is a complex, governed process
    - Removing incomplete implementation to avoid confusion
    - Existing barcode data will be lost - this is intentional cleanup
*/

-- Remove barcode column from products table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE products DROP COLUMN barcode;
  END IF;
END $$;

-- Remove barcode column from invoice_items table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoice_items' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE invoice_items DROP COLUMN barcode;
  END IF;
END $$;
