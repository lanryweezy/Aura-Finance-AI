-- ============================================================
-- Migration: Add missing CHECK constraints for amounts
-- Gap Closed: Prevents negative values in financial transaction amounts (transactions, invoices, bills, payments) which could break aggregate calculations or lead to invalid application state.
-- ============================================================

ALTER TABLE transactions ADD CONSTRAINT transactions_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_total_check CHECK (total >= 0) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE payments ADD CONSTRAINT payments_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE card_transactions ADD CONSTRAINT card_transactions_amount_check CHECK (amount >= 0) NOT VALID;

/*
-- DOWN Migration:
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_amount_check;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_amount_check;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_total_check;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_amount_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_amount_check;
ALTER TABLE card_transactions DROP CONSTRAINT IF EXISTS card_transactions_amount_check;
*/
