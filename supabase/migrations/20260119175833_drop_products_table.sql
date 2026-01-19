/*
  # Drop Products Table

  1. Changes
    - Drop `products` table completely
    - This removes all product management functionality from the database
  
  2. Notes
    - Product management system is being removed from the application
    - All product data will be permanently deleted
    - No foreign key constraints exist that reference this table
*/

-- Drop products table if it exists
DROP TABLE IF EXISTS products CASCADE;
