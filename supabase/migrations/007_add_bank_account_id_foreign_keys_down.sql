-- DOWN
ALTER TABLE reconciliation_sessions DROP CONSTRAINT IF EXISTS reconciliation_sessions_bank_account_id_fkey;
ALTER TABLE reconciliations DROP CONSTRAINT IF EXISTS reconciliations_bank_account_id_fkey;
