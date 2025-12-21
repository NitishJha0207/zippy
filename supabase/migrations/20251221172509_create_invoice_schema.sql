-- Invoice Generator Application Schema
--
-- This migration creates the complete database schema for the invoice generator application.
--
-- Tables Created:
-- 1. profiles - User and company information
-- 2. customers - Saved customer database
-- 3. invoices - Invoice headers
-- 4. invoice_items - Invoice line items
-- 5. invoice_sequence - Auto-increment invoice numbers
--
-- Security: All tables have RLS enabled with user-specific policies

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_address TEXT NOT NULL,
  gstin TEXT NOT NULL,
  company_logo_url TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  default_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  gstin TEXT,
  state TEXT NOT NULL,
  state_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers" 
  ON customers FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" 
  ON customers FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" 
  ON customers FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" 
  ON customers FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Bill To Party
  bill_to_name TEXT NOT NULL,
  bill_to_address TEXT NOT NULL,
  bill_to_gstin TEXT,
  bill_to_state TEXT NOT NULL,
  bill_to_state_code TEXT,
  
  -- Ship To Party
  ship_to_name TEXT NOT NULL,
  ship_to_address TEXT NOT NULL,
  ship_to_gstin TEXT,
  ship_to_state TEXT NOT NULL,
  ship_to_state_code TEXT,
  
  -- Invoice Metadata
  transport_mode TEXT DEFAULT 'Road',
  vehicle_number TEXT,
  reverse_charge BOOLEAN DEFAULT false,
  place_of_supply TEXT NOT NULL,
  
  -- Totals
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  cgst_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  sgst_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Bank Details
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  
  -- Terms & Conditions
  terms_conditions TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_invoice_number_per_user UNIQUE (user_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(user_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(user_id, invoice_date DESC);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" 
  ON invoices FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" 
  ON invoices FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" 
  ON invoices FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" 
  ON invoices FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  product_description TEXT NOT NULL,
  students_staff TEXT,
  hsn_code TEXT NOT NULL,
  rate DECIMAL(12,2) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  amount DECIMAL(12,2) NOT NULL,
  gst_rate DECIMAL(5,2) NOT NULL,
  taxable_value DECIMAL(12,2) NOT NULL,
  cgst DECIMAL(12,2) NOT NULL,
  sgst DECIMAL(12,2) NOT NULL,
  
  item_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_order ON invoice_items(invoice_id, item_order);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoice items" 
  ON invoice_items FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice items" 
  ON invoice_items FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items" 
  ON invoice_items FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items" 
  ON invoice_items FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Create invoice_sequence table
CREATE TABLE IF NOT EXISTS invoice_sequence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_invoice_number INTEGER DEFAULT 0,
  prefix TEXT DEFAULT 'INV',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoice_sequence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sequence" 
  ON invoice_sequence FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sequence" 
  ON invoice_sequence FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sequence" 
  ON invoice_sequence FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);