-- ============================================================
-- Migration: Add missing foreign keys for vendor_id and item_id
-- Gap Closed: Ensures `vendor_id` and `item_id` reference valid `contacts` and `inventory` records respectively.
-- Invalid state prevented: orphaned vendor portal links and stock movements when a contact or inventory item is deleted.
-- ============================================================

-- UP
-- Note: we are NOT deleting or updating orphaned data in this migration
-- because doing so would cause irreversible data loss. We are applying
-- the constraint with NOT VALID so that new inserts/updates are verified,
-- and existing data is left alone until a safe remediation plan is executed.

-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE vendor_portal_links ADD CONSTRAINT vendor_portal_links_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES contacts(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE CASCADE NOT VALID;

-- Note: In a subsequent deploy, we will need to run VALIDATE CONSTRAINT after manually handling existing violations.
