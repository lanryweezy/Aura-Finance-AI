-- ============================================================
-- Migration: Add CHECK constraints for temporal ordering of lifecycle timestamps
-- Gap Closed: Prevents invalid states where an entity is marked as completed, confirmed, filed, resolved, reimbursed, or closed before it was created or started.
-- Invalid state prevented: Timeline corruption, negative duration calculations in analytics/reports, and impossible state transitions.
-- ============================================================

ALTER TABLE sync_logs ADD CONSTRAINT sync_logs_completed_at_check CHECK (completed_at >= started_at) NOT VALID;
ALTER TABLE bulk_payments ADD CONSTRAINT bulk_payments_completed_at_check CHECK (completed_at >= created_at) NOT VALID;
ALTER TABLE reconciliation_sessions ADD CONSTRAINT reconciliation_sessions_completed_at_check CHECK (completed_at >= created_at) NOT VALID;
ALTER TABLE nrs_submissions ADD CONSTRAINT nrs_submissions_confirmed_at_check CHECK (confirmed_at >= submitted_at) NOT VALID;
ALTER TABLE tax_filings ADD CONSTRAINT tax_filings_filed_at_check CHECK (filed_at >= created_at) NOT VALID;
ALTER TABLE approval_requests ADD CONSTRAINT approval_requests_resolved_at_check CHECK (resolved_at >= created_at) NOT VALID;
ALTER TABLE expense_claims ADD CONSTRAINT expense_claims_reimbursed_at_check CHECK (reimbursed_at >= created_at) NOT VALID;
ALTER TABLE closing_periods ADD CONSTRAINT closing_periods_closed_at_check CHECK (closed_at >= created_at) NOT VALID;

/*
-- DOWN Migration:
ALTER TABLE sync_logs DROP CONSTRAINT IF EXISTS sync_logs_completed_at_check;
ALTER TABLE bulk_payments DROP CONSTRAINT IF EXISTS bulk_payments_completed_at_check;
ALTER TABLE reconciliation_sessions DROP CONSTRAINT IF EXISTS reconciliation_sessions_completed_at_check;
ALTER TABLE nrs_submissions DROP CONSTRAINT IF EXISTS nrs_submissions_confirmed_at_check;
ALTER TABLE tax_filings DROP CONSTRAINT IF EXISTS tax_filings_filed_at_check;
ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_resolved_at_check;
ALTER TABLE expense_claims DROP CONSTRAINT IF EXISTS expense_claims_reimbursed_at_check;
ALTER TABLE closing_periods DROP CONSTRAINT IF EXISTS closing_periods_closed_at_check;
*/
