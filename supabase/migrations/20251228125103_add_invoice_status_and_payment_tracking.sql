/*
  # Add Invoice Status and Payment Tracking

  ## Summary
  This migration adds comprehensive invoice status tracking, payment integration, 
  subscription management, and reminder functionality.

  ## Changes

  ### 1. Invoice Status & Payment Tracking
  
  Adds to `invoices` table:
  - `status` (enum): Tracks invoice lifecycle - 'draft', 'sent', 'paid', 'overdue'
  - `customer_id` (uuid): Links invoice to customer record
  - `due_date` (date): Payment due date for calculating overdue status
  - `payment_date` (timestamptz): When payment was received
  - `payment_method` (text): How customer paid (UPI, card, cash, etc.)
  - `payment_link` (text): Razorpay or other payment gateway link
  - `payment_id` (text): External payment gateway transaction ID
  - `sent_date` (timestamptz): When invoice was sent to customer
  - `notes` (text): Internal notes about the invoice

  ### 2. Subscription Tiers
  
  Adds to `profiles` table:
  - `subscription_tier` (text): 'free', 'starter', 'pro', 'business'
  - `subscription_status` (text): 'active', 'canceled', 'expired'
  - `subscription_start_date` (timestamptz): When subscription started
  - `subscription_end_date` (timestamptz): When subscription expires
  - `monthly_invoice_count` (integer): Tracks usage for free tier limit
  - `last_reset_date` (timestamptz): When monthly count was last reset

  ### 3. Reminder Settings
  
  Creates new `reminder_settings` table:
  - User-specific reminder configurations
  - Enable/disable reminders
  - Customize reminder schedule (days before/after due date)
  - Message templates

  ### 4. Payment Reminders Log
  
  Creates new `payment_reminders` table:
  - Tracks sent reminders
  - Prevents duplicate reminders
  - Records delivery status

  ## Security
  - All new tables have RLS enabled
  - Policies ensure users can only access their own data
  - Foreign key constraints maintain data integrity
*/

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status_enum') THEN
    CREATE TYPE invoice_status_enum AS ENUM ('draft', 'sent', 'paid', 'overdue');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'status'
  ) THEN
    ALTER TABLE invoices ADD COLUMN status invoice_status_enum DEFAULT 'draft' NOT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE invoices ADD COLUMN due_date date;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_date timestamptz;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_method text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'payment_link'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_link text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_id text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'sent_date'
  ) THEN
    ALTER TABLE invoices ADD COLUMN sent_date timestamptz;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'notes'
  ) THEN
    ALTER TABLE invoices ADD COLUMN notes text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'free' NOT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'active' NOT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_start_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_start_date timestamptz DEFAULT now();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_end_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_end_date timestamptz;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'monthly_invoice_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN monthly_invoice_count integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_reset_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_reset_date timestamptz DEFAULT now();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS reminder_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false NOT NULL,
  remind_before_days integer DEFAULT 1 NOT NULL,
  remind_on_due_date boolean DEFAULT true NOT NULL,
  remind_after_days integer[] DEFAULT ARRAY[3, 7] NOT NULL,
  whatsapp_enabled boolean DEFAULT false NOT NULL,
  email_enabled boolean DEFAULT true NOT NULL,
  message_template text DEFAULT 'Hi {{CustomerName}}, your invoice {{InvoiceNumber}} of ₹{{Amount}} is due on {{DueDate}}. Please pay at your earliest convenience. Thank you!',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminder settings"
  ON reminder_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own reminder settings"
  ON reminder_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminder settings"
  ON reminder_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS payment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_type text NOT NULL,
  sent_date timestamptz DEFAULT now() NOT NULL,
  delivery_status text DEFAULT 'sent' NOT NULL,
  delivery_channel text NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON payment_reminders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON payment_reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_status'
  ) THEN
    CREATE INDEX idx_invoices_status ON invoices(status);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_due_date'
  ) THEN
    CREATE INDEX idx_invoices_due_date ON invoices(due_date);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_customer_id'
  ) THEN
    CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
  END IF;
END $$;