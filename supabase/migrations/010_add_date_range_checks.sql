-- Migration: Add CHECK constraints to enforce logical temporal ordering of dates
-- Gap Closed: Ensures that end dates, due dates, expiry dates, and completion timestamps
--             are logically after or equal to their corresponding start, issue, or creation dates.
--             This prevents invalid timeline states (e.g. an invoice due before it's issued,
--             or a leave request ending before it starts) which can break reporting and logic.

ALTER TABLE projects ADD CONSTRAINT projects_date_range_check CHECK (end_date IS NULL OR end_date >= start_date) NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_date_range_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_date_range_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_date_range_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE estimates ADD CONSTRAINT estimates_date_range_check CHECK (expiry_date >= issue_date) NOT VALID;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_date_range_check CHECK (expected_delivery_date >= issue_date) NOT VALID;
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_date_range_check CHECK (disposal_date IS NULL OR disposal_date >= purchase_date) NOT VALID;
ALTER TABLE bulk_payments ADD CONSTRAINT bulk_payments_date_range_check CHECK (completed_at IS NULL OR completed_at >= created_at) NOT VALID;
ALTER TABLE reconciliation_sessions ADD CONSTRAINT reconciliation_sessions_date_range_check CHECK (completed_at IS NULL OR completed_at >= created_at) NOT VALID;
ALTER TABLE sync_logs ADD CONSTRAINT sync_logs_date_range_check CHECK (completed_at IS NULL OR completed_at >= started_at) NOT VALID;

/*
-- DOWN Migration
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_date_range_check;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_date_range_check;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_date_range_check;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_date_range_check;
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_date_range_check;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_date_range_check;
ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_date_range_check;
ALTER TABLE bulk_payments DROP CONSTRAINT IF EXISTS bulk_payments_date_range_check;
ALTER TABLE reconciliation_sessions DROP CONSTRAINT IF EXISTS reconciliation_sessions_date_range_check;
ALTER TABLE sync_logs DROP CONSTRAINT IF EXISTS sync_logs_date_range_check;
*/
