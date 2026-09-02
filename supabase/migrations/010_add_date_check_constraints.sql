-- ============================================================
-- Migration: Add CHECK constraints to chronological date columns
-- Gap Closed: Ensures logically sequential dates are valid at the DB layer.
-- Invalid state prevented: end dates occurring before start dates, due dates before issue dates, which break financial temporal logic.
-- ============================================================

-- UP
ALTER TABLE invoices ADD CONSTRAINT invoices_due_date_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_due_date_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE estimates ADD CONSTRAINT estimates_expiry_date_check CHECK (expiry_date >= issue_date) NOT VALID;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_delivery_date_check CHECK (expected_delivery_date >= issue_date) NOT VALID;
ALTER TABLE projects ADD CONSTRAINT projects_dates_check CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date) NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_dates_check CHECK (end_date >= start_date) NOT VALID;

-- Ensure missing status check constraint for client_portal_links is added
ALTER TABLE client_portal_links ADD CONSTRAINT client_portal_links_status_check CHECK (status IN ('Paid', 'Unpaid', 'Overdue', 'Draft', 'active', 'viewed', 'expired', 'revoked')) NOT VALID;

/*
-- DOWN
ALTER TABLE client_portal_links DROP CONSTRAINT IF EXISTS client_portal_links_status_check;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_dates_check;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_dates_check;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_delivery_date_check;
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_expiry_date_check;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_due_date_check;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_due_date_check;
*/
