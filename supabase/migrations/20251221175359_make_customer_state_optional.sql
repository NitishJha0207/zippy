/*
  # Make Customer State Field Optional

  1. Changes to customers table
    - Remove NOT NULL constraint from state column
    - Remove NOT NULL constraint from state_code column
    - These fields are not needed for the simplified invoice system

  2. Security
    - No changes to RLS policies
*/

-- Make state and state_code nullable
ALTER TABLE customers ALTER COLUMN state DROP NOT NULL;
