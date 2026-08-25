-- ============================================================
-- Migration: Add missing foreign keys for item_id and vendor_id
-- Gap Closed: Ensures `item_id` in `stock_movements` references valid `inventory` records, and `vendor_id` in `vendor_portal_links` references valid `contacts`.
-- Invalid state prevented: orphaned stock movements when an inventory item is deleted, and orphaned vendor portal links when a vendor contact is deleted.
-- ============================================================

-- UP
-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE vendor_portal_links ADD CONSTRAINT vendor_portal_links_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES contacts(id) ON DELETE CASCADE NOT VALID;

-- Note: In a subsequent deploy, we will need to run VALIDATE CONSTRAINT after handling existing violations.
