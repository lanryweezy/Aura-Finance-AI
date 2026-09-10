-- Add CHECK constraints to enforce logical temporal ordering of dates.
-- This prevents invalid timelines (e.g., a project ending before it starts, or an invoice due before it is issued)
-- which could corrupt financial reports, projections, and UI sorting.
-- We use NOT VALID to avoid heavy table locks and safely apply constraints without downtime.

ALTER TABLE projects ADD CONSTRAINT projects_date_range_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_date_range_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_date_range_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_date_range_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_date_range_check CHECK (expected_delivery_date >= issue_date) NOT VALID;
ALTER TABLE estimates ADD CONSTRAINT estimates_date_range_check CHECK (expiry_date >= issue_date) NOT VALID;
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_date_range_check CHECK (disposal_date >= purchase_date) NOT VALID;

/*
-- DOWN MIGRATION
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_date_range_check;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_date_range_check;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_date_range_check;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_date_range_check;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_date_range_check;
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_date_range_check;
ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_date_range_check;
*/
