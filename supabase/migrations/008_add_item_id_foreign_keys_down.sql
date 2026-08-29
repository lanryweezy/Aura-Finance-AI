-- ============================================================
-- DOWN Migration: Add missing foreign keys for item_id in stock_movements
-- ============================================================

ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_item_id_fkey;
