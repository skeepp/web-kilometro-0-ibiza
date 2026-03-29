-- ============================================
-- CLICK & COLLECT MIGRATION
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Add pickup_address to producers
ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS pickup_address text;

-- 2. Add pickup_code to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_code text;

-- 3. Update order status constraint to Click & Collect statuses
-- First drop the old constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Then add the new one
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('paid', 'preparing', 'ready_pickup', 'picked_up', 'cancelled'));

-- 4. Migrate existing order statuses
UPDATE public.orders SET status = 'paid' WHERE status = 'pending';
UPDATE public.orders SET status = 'picked_up' WHERE status IN ('shipped', 'delivered');

-- 5. Set shipping_cost to 0 for all existing orders (Click & Collect = no shipping)
UPDATE public.orders SET shipping_cost = 0;
