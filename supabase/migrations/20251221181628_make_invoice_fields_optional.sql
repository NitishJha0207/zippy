/*
  # Make Invoice Bill-To and Ship-To Fields Optional

  1. Changes to invoices table
    - Remove NOT NULL constraint from bill_to_name
    - Remove NOT NULL constraint from bill_to_address
    - Remove NOT NULL constraint from bill_to_state
    - Remove NOT NULL constraint from ship_to_name
    - Remove NOT NULL constraint from ship_to_address
    - Remove NOT NULL constraint from ship_to_state
    - Remove NOT NULL constraint from place_of_supply
    - Remove NOT NULL constraint from subtotal (now using subtotal_amount)
    - Remove NOT NULL constraint from cgst_total
    - Remove NOT NULL constraint from sgst_total
    - Remove NOT NULL constraint from total_tax
    - Remove NOT NULL constraint from grand_total (now using total_amount)

  2. Rationale
    - The application uses a simplified invoice model with customer_id reference
    - Customer data is stored separately in the customers table
    - Bill-to and ship-to fields are legacy fields that are no longer required
    - The new model uses subtotal_amount, tax_amount, and total_amount fields

  3. Security
    - No changes to RLS policies
*/

-- Make bill-to fields nullable
ALTER TABLE invoices ALTER COLUMN bill_to_name DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN bill_to_address DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN bill_to_state DROP NOT NULL;

-- Make ship-to fields nullable
ALTER TABLE invoices ALTER COLUMN ship_to_name DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN ship_to_address DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN ship_to_state DROP NOT NULL;

-- Make place_of_supply nullable
ALTER TABLE invoices ALTER COLUMN place_of_supply DROP NOT NULL;

-- Make legacy total fields nullable
ALTER TABLE invoices ALTER COLUMN subtotal DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN cgst_total DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN sgst_total DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN total_tax DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN grand_total DROP NOT NULL;