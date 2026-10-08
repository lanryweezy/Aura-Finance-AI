-- ============================================================
-- Migration: Add missing CHECK constraints for estimates, purchase orders, receipt scans, and client portal links total amount
-- Gap Closed: Prevents negative values in these tables' total amounts which could break aggregate calculations or lead to invalid application state.
-- ============================================================

-- UP
ALTER TABLE estimates ADD CONSTRAINT estimates_total_check CHECK (total >= 0) NOT VALID;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_total_check CHECK (total >= 0) NOT VALID;
ALTER TABLE receipt_scans ADD CONSTRAINT receipt_scans_total_amount_check CHECK (total_amount >= 0) NOT VALID;
ALTER TABLE client_portal_links ADD CONSTRAINT client_portal_links_total_amount_check CHECK (total_amount >= 0) NOT VALID;

/*
-- DOWN
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_total_check;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_total_check;
ALTER TABLE receipt_scans DROP CONSTRAINT IF EXISTS receipt_scans_total_amount_check;
ALTER TABLE client_portal_links DROP CONSTRAINT IF EXISTS client_portal_links_total_amount_check;
*/
