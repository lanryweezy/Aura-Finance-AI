-- ============================================================
-- Migration: Add missing foreign keys for user references
-- Gap Closed: Ensures that user references (e.g. created_by, approved_by) always map to valid users in the system.
-- Invalid state prevented: orphaned financial or workflow records pointing to deleted or non-existent users, breaking audit trails and permissions.
-- ============================================================

-- UP
ALTER TABLE corporate_cards ADD CONSTRAINT corporate_cards_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE expenses ADD CONSTRAINT expenses_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE expenses ADD CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE approval_requests ADD CONSTRAINT approval_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE closing_periods ADD CONSTRAINT closing_periods_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE partial_payments ADD CONSTRAINT partial_payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE credit_notes ADD CONSTRAINT credit_notes_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE projects ADD CONSTRAINT projects_manager_fkey FOREIGN KEY (manager) REFERENCES users(id) ON DELETE SET NULL NOT VALID;

/*
-- DOWN
ALTER TABLE corporate_cards DROP CONSTRAINT IF EXISTS corporate_cards_assigned_to_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_submitted_by_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_approved_by_fkey;
ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_requested_by_fkey;
ALTER TABLE closing_periods DROP CONSTRAINT IF EXISTS closing_periods_closed_by_fkey;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_created_by_fkey;
ALTER TABLE partial_payments DROP CONSTRAINT IF EXISTS partial_payments_recorded_by_fkey;
ALTER TABLE credit_notes DROP CONSTRAINT IF EXISTS credit_notes_issued_by_fkey;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_approved_by_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_manager_fkey;
*/
