/*
  # Add Barcode Support to Invoice Items

  1. Changes
    - Add `barcode` column to `invoice_items` table
    - This field is optional and stores the barcode value for products
    - Supports various barcode formats (EAN-13, Code128, etc.)
  
  2. Notes
    - Field is nullable as not all products require barcodes
    - Barcode values will be validated client-side
    - Barcodes will be displayed on invoices and PDF exports
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoice_items' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE invoice_items ADD COLUMN barcode TEXT;
  END IF;
END $$;
