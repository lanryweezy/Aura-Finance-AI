-- ============================================================
-- Migration: Add missing CHECK constraints for inventory and stock movements
-- Gap Closed: Prevents negative values in inventory quantity and stock_movements unit/total costs, ensuring stock levels and valuations are logically valid.
-- Invalid state prevented: A product having negative stock, leading to invalid inventory valuation.
-- ============================================================

-- UP
ALTER TABLE inventory ADD CONSTRAINT inventory_quantity_check CHECK (quantity >= 0) NOT VALID;
ALTER TABLE inventory ADD CONSTRAINT inventory_low_stock_threshold_check CHECK (low_stock_threshold >= 0) NOT VALID;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_unit_cost_check CHECK (unit_cost >= 0) NOT VALID;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_total_cost_check CHECK (total_cost >= 0) NOT VALID;

/*
-- DOWN
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_quantity_check;
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_low_stock_threshold_check;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_unit_cost_check;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_total_cost_check;
*/
