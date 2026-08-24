-- ============================================================
-- Migration: Add missing foreign keys for bank_account_id
-- Gap Closed: Ensures `bank_account_id` references valid `bank_connections`.
-- Invalid state prevented: orphaned reconciliation and reconciliation_session records when a bank connection is deleted.
-- ============================================================

-- UP
-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE reconciliations ADD CONSTRAINT reconciliations_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_connections(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE reconciliation_sessions ADD CONSTRAINT reconciliation_sessions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_connections(id) ON DELETE CASCADE NOT VALID;

-- Note: In a subsequent deploy, we will need to run VALIDATE CONSTRAINT after handling existing violations.
