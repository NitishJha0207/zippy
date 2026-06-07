-- Remove 'starter' tier from subscription_tier, add is_admin column if missing
-- Ensure subscription dates are strictly managed

-- Add is_admin column if not present
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Ensure subscription columns exist with correct types
ALTER TABLE profiles
  ALTER COLUMN subscription_tier SET DEFAULT 'free',
  ALTER COLUMN subscription_status SET DEFAULT 'active',
  ALTER COLUMN monthly_invoice_count SET DEFAULT 0;

-- Ensure subscription_end_date is timestamptz
ALTER TABLE profiles
  ALTER COLUMN subscription_start_date TYPE timestamptz USING subscription_start_date::timestamptz,
  ALTER COLUMN subscription_end_date TYPE timestamptz USING subscription_end_date::timestamptz;

-- Function: when subscription_end_date has passed, auto-expire and downgrade to free
CREATE OR REPLACE FUNCTION check_and_expire_subscription(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    subscription_tier   = 'free',
    subscription_status = 'expired',
    subscription_end_date = subscription_end_date -- keep date for audit
  WHERE
    id = p_user_id
    AND subscription_tier IN ('pro', 'business')
    AND subscription_end_date IS NOT NULL
    AND subscription_end_date < now()
    AND subscription_status != 'expired';
END;
$$;

-- Function: activate a new subscription (exact 30 days, no rounding)
CREATE OR REPLACE FUNCTION activate_subscription(
  p_user_id uuid,
  p_tier    text  -- 'pro' or 'business'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start timestamptz := now();
  v_end   timestamptz := now() + INTERVAL '30 days';
BEGIN
  IF p_tier NOT IN ('pro', 'business') THEN
    RAISE EXCEPTION 'Invalid tier: %', p_tier;
  END IF;

  UPDATE profiles
  SET
    subscription_tier        = p_tier,
    subscription_status      = 'active',
    subscription_start_date  = v_start,
    subscription_end_date    = v_end
  WHERE id = p_user_id;
END;
$$;

-- Function: reset monthly invoice count when calendar month changes
CREATE OR REPLACE FUNCTION maybe_reset_monthly_invoice_count(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_reset date;
  v_today      date := current_date;
BEGIN
  SELECT last_reset_date::date INTO v_last_reset
  FROM profiles
  WHERE id = p_user_id;

  -- Reset if we are in a different calendar month than the last reset
  IF v_last_reset IS NULL
     OR date_trunc('month', v_last_reset) < date_trunc('month', v_today) THEN
    UPDATE profiles
    SET
      monthly_invoice_count = 0,
      last_reset_date       = now()
    WHERE id = p_user_id;
  END IF;
END;
$$;

-- Grant execute to authenticated users on their own profile functions
GRANT EXECUTE ON FUNCTION check_and_expire_subscription(uuid)    TO authenticated;
GRANT EXECUTE ON FUNCTION activate_subscription(uuid, text)       TO authenticated;
GRANT EXECUTE ON FUNCTION maybe_reset_monthly_invoice_count(uuid) TO authenticated;

-- Trigger: increment monthly_invoice_count when an invoice is inserted
CREATE OR REPLACE FUNCTION increment_monthly_invoice_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET monthly_invoice_count = monthly_invoice_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_invoice_count ON invoices;
CREATE TRIGGER trg_increment_invoice_count
  AFTER INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION increment_monthly_invoice_count();
