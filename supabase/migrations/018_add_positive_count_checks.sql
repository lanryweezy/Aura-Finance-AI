-- ============================================================
-- Migration: Add CHECK constraints to integer count columns
-- Gap Closed: Ensures that various integer counters (counts, levels, next_numbers) cannot be negative.
-- Invalid state prevented: storing negative counts or sizes, which would break display logic, sequence generation, or aggregate calculations.
-- ============================================================

-- UP
ALTER TABLE usage_tracking ADD CONSTRAINT usage_tracking_count_check CHECK (count >= 0) NOT VALID;
ALTER TABLE approval_requests ADD CONSTRAINT approval_requests_current_level_check CHECK (current_level >= 0) NOT VALID;
ALTER TABLE approval_requests ADD CONSTRAINT approval_requests_total_levels_check CHECK (total_levels >= 0) NOT VALID;
ALTER TABLE bulk_payments ADD CONSTRAINT bulk_payments_recipient_count_check CHECK (recipient_count >= 0) NOT VALID;
ALTER TABLE bulk_payments ADD CONSTRAINT bulk_payments_processed_count_check CHECK (processed_count >= 0) NOT VALID;
ALTER TABLE bulk_payments ADD CONSTRAINT bulk_payments_failed_count_check CHECK (failed_count >= 0) NOT VALID;
ALTER TABLE reconciliation_sessions ADD CONSTRAINT reconciliation_sessions_matched_count_check CHECK (matched_count >= 0) NOT VALID;
ALTER TABLE reconciliation_sessions ADD CONSTRAINT reconciliation_sessions_unmatched_count_check CHECK (unmatched_count >= 0) NOT VALID;
ALTER TABLE webhooks ADD CONSTRAINT webhooks_failure_count_check CHECK (failure_count >= 0) NOT VALID;
ALTER TABLE sync_logs ADD CONSTRAINT sync_logs_synced_count_check CHECK (synced_count >= 0) NOT VALID;
ALTER TABLE sync_logs ADD CONSTRAINT sync_logs_error_count_check CHECK (error_count >= 0) NOT VALID;
ALTER TABLE invoice_sequences ADD CONSTRAINT invoice_sequences_next_number_check CHECK (next_number >= 0) NOT VALID;
ALTER TABLE remittance_records ADD CONSTRAINT remittance_records_employee_count_check CHECK (employee_count >= 0) NOT VALID;

/*
-- DOWN
ALTER TABLE usage_tracking DROP CONSTRAINT IF EXISTS usage_tracking_count_check;
ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_current_level_check;
ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_total_levels_check;
ALTER TABLE bulk_payments DROP CONSTRAINT IF EXISTS bulk_payments_recipient_count_check;
ALTER TABLE bulk_payments DROP CONSTRAINT IF EXISTS bulk_payments_processed_count_check;
ALTER TABLE bulk_payments DROP CONSTRAINT IF EXISTS bulk_payments_failed_count_check;
ALTER TABLE reconciliation_sessions DROP CONSTRAINT IF EXISTS reconciliation_sessions_matched_count_check;
ALTER TABLE reconciliation_sessions DROP CONSTRAINT IF EXISTS reconciliation_sessions_unmatched_count_check;
ALTER TABLE webhooks DROP CONSTRAINT IF EXISTS webhooks_failure_count_check;
ALTER TABLE sync_logs DROP CONSTRAINT IF EXISTS sync_logs_synced_count_check;
ALTER TABLE sync_logs DROP CONSTRAINT IF EXISTS sync_logs_error_count_check;
ALTER TABLE invoice_sequences DROP CONSTRAINT IF EXISTS invoice_sequences_next_number_check;
ALTER TABLE remittance_records DROP CONSTRAINT IF EXISTS remittance_records_employee_count_check;
*/
