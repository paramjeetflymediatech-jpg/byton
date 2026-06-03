-- Run this in your Supabase SQL Editor:
-- https://app.supabase.com → your project → SQL Editor

-- 1. Add the `channel` column to the orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT NULL;

-- 2. Back-fill existing orders based on ID prefix
UPDATE orders SET channel = 'ebay'    WHERE id LIKE 'EB-%' AND channel IS NULL;
UPDATE orders SET channel = 'tiktok'  WHERE id LIKE 'TT-%' AND channel IS NULL;
UPDATE orders SET channel = 'website' WHERE channel IS NULL;

-- 3. (Optional) Add an index for faster channel filtering
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel);
