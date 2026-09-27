-- ============================================================
-- Migration: Add missing CHECK constraints for remaining numeric/amount columns
-- Gap Closed: Prevents negative values in financial transaction amounts, limits, balances, and measurable quantities (like hours/kilometers) which could break aggregate calculations or lead to invalid application state.
-- ============================================================

-- UP
ALTER TABLE recurring_invoices ADD CONSTRAINT recurring_invoices_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE payment_links ADD CONSTRAINT payment_links_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE spend_policies ADD CONSTRAINT spend_policies_max_amount_check CHECK (max_amount >= 0) NOT VALID;
ALTER TABLE spend_policies ADD CONSTRAINT spend_policies_max_daily_check CHECK (max_daily >= 0) NOT VALID;
ALTER TABLE spend_policies ADD CONSTRAINT spend_policies_max_monthly_check CHECK (max_monthly >= 0) NOT VALID;
ALTER TABLE partial_payments ADD CONSTRAINT partial_payments_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE credit_notes ADD CONSTRAINT credit_notes_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE overtime_records ADD CONSTRAINT overtime_records_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE overtime_records ADD CONSTRAINT overtime_records_hours_check CHECK (hours >= 0) NOT VALID;
ALTER TABLE mileage_entries ADD CONSTRAINT mileage_entries_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE mileage_entries ADD CONSTRAINT mileage_entries_kilometers_check CHECK (kilometers >= 0) NOT VALID;
ALTER TABLE remittance_records ADD CONSTRAINT remittance_records_total_amount_check CHECK (total_amount >= 0) NOT VALID;
ALTER TABLE bulk_payments ADD CONSTRAINT bulk_payments_total_amount_check CHECK (total_amount >= 0) NOT VALID;
ALTER TABLE bulk_payment_recipients ADD CONSTRAINT bulk_payment_recipients_amount_check CHECK (amount >= 0) NOT VALID;
ALTER TABLE tax_filings ADD CONSTRAINT tax_filings_taxable_amount_check CHECK (taxable_amount >= 0) NOT VALID;
ALTER TABLE tax_filings ADD CONSTRAINT tax_filings_tax_amount_check CHECK (tax_amount >= 0) NOT VALID;
ALTER TABLE approval_requests ADD CONSTRAINT approval_requests_amount_check CHECK (amount >= 0) NOT VALID;

/*
-- DOWN
ALTER TABLE recurring_invoices DROP CONSTRAINT IF EXISTS recurring_invoices_amount_check;
ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS payment_links_amount_check;
ALTER TABLE spend_policies DROP CONSTRAINT IF EXISTS spend_policies_max_amount_check;
ALTER TABLE spend_policies DROP CONSTRAINT IF EXISTS spend_policies_max_daily_check;
ALTER TABLE spend_policies DROP CONSTRAINT IF EXISTS spend_policies_max_monthly_check;
ALTER TABLE partial_payments DROP CONSTRAINT IF EXISTS partial_payments_amount_check;
ALTER TABLE credit_notes DROP CONSTRAINT IF EXISTS credit_notes_amount_check;
ALTER TABLE overtime_records DROP CONSTRAINT IF EXISTS overtime_records_amount_check;
ALTER TABLE overtime_records DROP CONSTRAINT IF EXISTS overtime_records_hours_check;
ALTER TABLE mileage_entries DROP CONSTRAINT IF EXISTS mileage_entries_amount_check;
ALTER TABLE mileage_entries DROP CONSTRAINT IF EXISTS mileage_entries_kilometers_check;
ALTER TABLE remittance_records DROP CONSTRAINT IF EXISTS remittance_records_total_amount_check;
ALTER TABLE bulk_payments DROP CONSTRAINT IF EXISTS bulk_payments_total_amount_check;
ALTER TABLE bulk_payment_recipients DROP CONSTRAINT IF EXISTS bulk_payment_recipients_amount_check;
ALTER TABLE tax_filings DROP CONSTRAINT IF EXISTS tax_filings_taxable_amount_check;
ALTER TABLE tax_filings DROP CONSTRAINT IF EXISTS tax_filings_tax_amount_check;
ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_amount_check;
*/
