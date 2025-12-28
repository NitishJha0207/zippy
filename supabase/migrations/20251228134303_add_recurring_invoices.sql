/*
  # Add Recurring Invoices

  ## Summary
  This migration adds support for recurring invoices, allowing users to automatically
  generate invoices on a schedule (daily, weekly, monthly, quarterly, yearly).

  ## Changes

  ### 1. Recurring Invoice Templates Table
  
  Creates `recurring_invoices` table:
  - Links to user and customer
  - Stores invoice template data (items, amounts, terms)
  - Defines recurrence pattern (frequency, start/end dates)
  - Tracks generation status and next generation date
  - Auto-generates invoices based on schedule

  ### 2. Invoice Template Items
  
  Creates `recurring_invoice_items` table:
  - Stores line items for the recurring template
  - Referenced when generating new invoices

  ### 3. Invoice Link to Recurring Template
  
  Adds to `invoices` table:
  - `recurring_invoice_id` - Links generated invoice to its recurring template
  - Helps track which invoices were auto-generated

  ## Security
  - RLS enabled on all tables
  - Users can only access their own recurring invoices
  - Foreign key constraints maintain data integrity
*/

CREATE TABLE IF NOT EXISTS recurring_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  
  template_name text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  
  start_date date NOT NULL,
  end_date date,
  next_generation_date date NOT NULL,
  last_generated_date date,
  
  is_active boolean DEFAULT true NOT NULL,
  
  transport_mode text DEFAULT 'Road',
  vehicle_number text,
  reverse_charge boolean DEFAULT false NOT NULL,
  place_of_supply text,
  
  ship_to_same boolean DEFAULT true NOT NULL,
  ship_to_name text,
  ship_to_address text,
  ship_to_gstin text,
  ship_to_state text,
  ship_to_state_code text,
  
  terms_conditions text,
  notes text,
  
  subtotal numeric(12,2) DEFAULT 0 NOT NULL,
  cgst_total numeric(12,2) DEFAULT 0 NOT NULL,
  sgst_total numeric(12,2) DEFAULT 0 NOT NULL,
  total_tax numeric(12,2) DEFAULT 0 NOT NULL,
  grand_total numeric(12,2) DEFAULT 0 NOT NULL,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring invoices"
  ON recurring_invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring invoices"
  ON recurring_invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring invoices"
  ON recurring_invoices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring invoices"
  ON recurring_invoices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS recurring_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_invoice_id uuid REFERENCES recurring_invoices(id) ON DELETE CASCADE NOT NULL,
  
  product_description text NOT NULL,
  students_staff text,
  hsn_code text,
  quantity numeric(10,2) DEFAULT 1 NOT NULL,
  rate numeric(12,2) DEFAULT 0 NOT NULL,
  amount numeric(12,2) DEFAULT 0 NOT NULL,
  
  gst_rate numeric(5,2) DEFAULT 0 NOT NULL,
  taxable_value numeric(12,2) DEFAULT 0 NOT NULL,
  cgst numeric(12,2) DEFAULT 0 NOT NULL,
  sgst numeric(12,2) DEFAULT 0 NOT NULL,
  
  item_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE recurring_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of own recurring invoices"
  ON recurring_invoice_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to own recurring invoices"
  ON recurring_invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items of own recurring invoices"
  ON recurring_invoice_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items of own recurring invoices"
  ON recurring_invoice_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'recurring_invoice_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN recurring_invoice_id uuid REFERENCES recurring_invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_recurring_invoices_user_id'
  ) THEN
    CREATE INDEX idx_recurring_invoices_user_id ON recurring_invoices(user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_recurring_invoices_next_generation'
  ) THEN
    CREATE INDEX idx_recurring_invoices_next_generation ON recurring_invoices(next_generation_date, is_active);
  END IF;
END $$;
