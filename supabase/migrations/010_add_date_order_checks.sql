-- ============================================================
-- Migration: Add date order checks
-- Gap Closed: Ensures start dates are not after end dates, issue dates are not after due/expiry dates
-- Invalid state prevented: Logical temporal paradoxes where a timeline ends before it begins.
-- ============================================================

-- UP
ALTER TABLE projects ADD CONSTRAINT projects_date_order_check CHECK (end_date >= start_date) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_date_order_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_date_order_check CHECK (due_date >= issue_date) NOT VALID;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_date_order_check CHECK (expected_delivery_date >= issue_date) NOT VALID;
ALTER TABLE estimates ADD CONSTRAINT estimates_date_order_check CHECK (expiry_date >= issue_date) NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_date_order_check CHECK (end_date >= start_date) NOT VALID;

-- Note: We are using NOT VALID here to avoid exclusive table locks during migration.
-- We can validate these constraints in a separate migration if needed.

-- DOWN
-- ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_date_order_check;
-- ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_date_order_check;
-- ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_date_order_check;
-- ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_date_order_check;
-- ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_date_order_check;
-- ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_date_order_check;
