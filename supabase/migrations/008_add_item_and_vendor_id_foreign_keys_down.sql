-- ============================================================
-- Migration: Revert foreign keys for item_id and vendor_id
-- ============================================================

-- DOWN
ALTER TABLE vendor_portal_links DROP CONSTRAINT IF EXISTS vendor_portal_links_vendor_id_fkey;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_item_id_fkey;
