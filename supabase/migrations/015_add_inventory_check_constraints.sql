-- ============================================================
-- Migration: Add missing CHECK constraints for inventory amounts
-- Gap Closed: Prevents negative values in inventory metrics (cost_price, sale_price, quantity, low_stock_threshold) which could break inventory valuation, ordering logic, and aggregate calculations.
-- ============================================================

-- UP
ALTER TABLE inventory ADD CONSTRAINT inventory_cost_price_check CHECK (cost_price >= 0) NOT VALID;
ALTER TABLE inventory ADD CONSTRAINT inventory_sale_price_check CHECK (sale_price >= 0) NOT VALID;
ALTER TABLE inventory ADD CONSTRAINT inventory_quantity_check CHECK (quantity >= 0) NOT VALID;
ALTER TABLE inventory ADD CONSTRAINT inventory_low_stock_threshold_check CHECK (low_stock_threshold >= 0) NOT VALID;

/*
-- DOWN
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_cost_price_check;
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_sale_price_check;
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_quantity_check;
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_low_stock_threshold_check;
*/
