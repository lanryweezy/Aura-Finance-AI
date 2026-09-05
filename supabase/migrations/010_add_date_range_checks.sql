-- ============================================================
-- Migration: Add CHECK constraints to temporal date ranges
-- Gap Closed: Ensures that logical temporal ordering is enforced at the database level (e.g. end_date >= start_date).
-- Invalid state prevented: Timeline invariants being broken (e.g. ending a project before it starts, due date before issue date).
-- ============================================================

-- UP
ALTER TABLE projects ADD CONSTRAINT projects_date_range_check CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_date_range_check CHECK (end_date >= start_date);
ALTER TABLE invoices ADD CONSTRAINT invoices_date_range_check CHECK (issue_date IS NULL OR due_date >= issue_date);
ALTER TABLE bills ADD CONSTRAINT bills_date_range_check CHECK (issue_date IS NULL OR due_date >= issue_date);
ALTER TABLE estimates ADD CONSTRAINT estimates_date_range_check CHECK (issue_date IS NULL OR expiry_date >= issue_date);
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_date_range_check CHECK (issue_date IS NULL OR expected_delivery_date >= issue_date);
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_date_range_check CHECK (disposal_date IS NULL OR disposal_date >= purchase_date);

-- DOWN
-- ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_date_range_check;
-- ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_date_range_check;
-- ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_date_range_check;
-- ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_date_range_check;
-- ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_date_range_check;
-- ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_date_range_check;
-- ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_date_range_check;
