/*
  # Update Invoice Sequence to Start at 101

  1. Changes
    - Update existing invoice sequences to start at 100 (so next invoice will be 101)
    - Update sequences that are currently less than 100 to ensure all new invoices start from 101
  
  2. Notes
    - This migration updates the `last_invoice_number` in the `invoice_sequence` table
    - Only updates sequences where the current number is less than 100
    - Sets prefix to empty string for numeric-only invoice numbers
*/

UPDATE invoice_sequence
SET last_invoice_number = 100,
    prefix = ''
WHERE last_invoice_number < 100;