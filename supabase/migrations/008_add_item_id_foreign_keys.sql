-- ============================================================
-- Migration: Add missing foreign keys for item_id in stock_movements
-- Gap Closed: Ensures `item_id` references valid `inventory` items.
-- Invalid state prevented: orphaned stock movements when an inventory item is deleted, or recording stock movements for non-existent items.
-- ============================================================

-- UP
-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE CASCADE NOT VALID;

-- Note: In a subsequent deploy, we will need to run VALIDATE CONSTRAINT after handling existing violations.
