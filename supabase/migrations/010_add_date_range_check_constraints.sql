-- ============================================================
-- Migration: Add CHECK constraints for date ranges
-- Gap Closed: Ensures chronological integrity for date ranges.
-- Invalid state prevented: Records where end date (e.g. end_date, due_date, expiry_date, expected_delivery_date) occurs before the start date (e.g. start_date, issue_date).
-- ============================================================

-- UP
-- Add CHECK constraints safely using NOT VALID
ALTER TABLE projects ADD CONSTRAINT projects_date_range_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_date_range_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_date_range_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_date_range_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_date_range_check CHECK (expected_delivery_date >= issue_date) NOT VALID;
ALTER TABLE estimates ADD CONSTRAINT estimates_date_range_check CHECK (expiry_date >= issue_date) NOT VALID;

/*
-- DOWN
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_date_range_check;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_date_range_check;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_date_range_check;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_date_range_check;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_date_range_check;
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_date_range_check;
*/
