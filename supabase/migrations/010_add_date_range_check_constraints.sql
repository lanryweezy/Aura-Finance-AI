-- ============================================================
-- Migration: Add CHECK constraints to temporal date ranges
-- Gap Closed: Ensures that logical time periods (e.g., end_date >= start_date) are strictly enforced at the database level.
-- Invalid state prevented: Prevents saving records with a start date after the end date, or a due date before the issue date, which breaks chronological timelines, dashboards, and financial calculations.
-- ============================================================

-- UP
ALTER TABLE projects ADD CONSTRAINT projects_date_range_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_date_range_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_due_date_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_due_date_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_delivery_date_check CHECK (expected_delivery_date >= issue_date) NOT VALID;
ALTER TABLE estimates ADD CONSTRAINT estimates_expiry_date_check CHECK (expiry_date >= issue_date) NOT VALID;

-- DOWN
/*
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_date_range_check;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_date_range_check;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_due_date_check;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_due_date_check;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_delivery_date_check;
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_expiry_date_check;
*/
