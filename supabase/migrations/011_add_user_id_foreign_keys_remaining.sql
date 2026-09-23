-- ============================================================
-- Migration: Add missing foreign keys for user references
-- Gap Closed: Ensures user reference columns point to valid `users`.
-- Invalid state prevented: orphaned records when a user is deleted, or insertion of records referencing non-existent users.
-- ============================================================

-- UP
-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE projects ADD CONSTRAINT projects_manager_fkey FOREIGN KEY (manager) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE closing_periods ADD CONSTRAINT closing_periods_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE corporate_cards ADD CONSTRAINT corporate_cards_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE approval_requests ADD CONSTRAINT approval_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE expenses ADD CONSTRAINT expenses_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE expenses ADD CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE partial_payments ADD CONSTRAINT partial_payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE credit_notes ADD CONSTRAINT credit_notes_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL NOT VALID;

-- Note: In a subsequent deploy, we will need to run VALIDATE CONSTRAINT after handling existing violations.

/*
-- DOWN
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_approved_by_fkey;
ALTER TABLE credit_notes DROP CONSTRAINT IF EXISTS credit_notes_issued_by_fkey;
ALTER TABLE partial_payments DROP CONSTRAINT IF EXISTS partial_payments_recorded_by_fkey;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_created_by_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_approved_by_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_submitted_by_fkey;
ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_requested_by_fkey;
ALTER TABLE corporate_cards DROP CONSTRAINT IF EXISTS corporate_cards_assigned_to_fkey;
ALTER TABLE closing_periods DROP CONSTRAINT IF EXISTS closing_periods_closed_by_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_manager_fkey;
*/
