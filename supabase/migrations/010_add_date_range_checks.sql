-- ============================================================
-- Migration: Add CHECK constraints to date ranges
-- Gap Closed: Ensures that end dates are always after or equal to start dates.
-- Invalid state prevented: storing logically impossible timeline states (e.g. a project ending before it starts, an invoice due before it is issued).
-- ============================================================

-- UP
-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE projects ADD CONSTRAINT projects_date_range_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_date_range_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_date_range_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_date_range_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_date_range_check CHECK (expected_delivery_date >= issue_date) NOT VALID;
ALTER TABLE estimates ADD CONSTRAINT estimates_date_range_check CHECK (expiry_date >= issue_date) NOT VALID;

-- Note: In a subsequent deploy, we will need to run VALIDATE CONSTRAINT after handling existing violations.

-- DOWN (Reversible migration logic for manual rollback, do not extract to a separate file)
-- ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_date_range_check;
-- ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_date_range_check;
-- ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_date_range_check;
-- ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_date_range_check;
-- ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_date_range_check;
-- ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_date_range_check;
