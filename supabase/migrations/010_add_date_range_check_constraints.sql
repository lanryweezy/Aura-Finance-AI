-- Migration: Add CHECK constraints to enforce logical temporal ordering of dates
-- This prevents invalid states like end dates occurring before start dates.

ALTER TABLE projects ADD CONSTRAINT projects_end_date_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_end_date_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_due_date_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_due_date_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_expected_delivery_date_check CHECK (expected_delivery_date >= issue_date) NOT VALID;
ALTER TABLE estimates ADD CONSTRAINT estimates_expiry_date_check CHECK (expiry_date >= issue_date) NOT VALID;

/*
-- DOWN Migration:
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_end_date_check;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_end_date_check;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_due_date_check;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_due_date_check;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_expected_delivery_date_check;
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_expiry_date_check;
*/
