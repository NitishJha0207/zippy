/*
  # Make Invoice Items Legacy Fields Optional

  1. Changes to invoice_items table
    - Remove NOT NULL constraint from product_description (replaced by description)
    - Remove NOT NULL constraint from hsn_code (not needed for simplified invoices)
    - Remove NOT NULL constraint from rate (replaced by unit_price)
    - Remove NOT NULL constraint from amount
    - Remove NOT NULL constraint from gst_rate (replaced by tax_rate)
    - Remove NOT NULL constraint from taxable_value
    - Remove NOT NULL constraint from cgst
    - Remove NOT NULL constraint from sgst

  2. Rationale
    - The application uses a simplified invoice item model with:
      - description (instead of product_description)
      - unit_price (instead of rate)
      - tax_rate (instead of gst_rate)
    - Legacy GST-specific fields (cgst, sgst, taxable_value, hsn_code) are not used
    - The new model calculates totals directly without separate CGST/SGST breakdown

  3. Security
    - No changes to RLS policies
*/

-- Make legacy invoice_items fields nullable
ALTER TABLE invoice_items ALTER COLUMN product_description DROP NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN hsn_code DROP NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN rate DROP NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN amount DROP NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN gst_rate DROP NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN taxable_value DROP NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN cgst DROP NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN sgst DROP NOT NULL;