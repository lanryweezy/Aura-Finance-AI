-- ============================================================
-- Migration: Add missing CHECK constraints for vat and project budgets
-- Gap Closed: Prevents negative values in vat for invoices, recurring invoices, receipt scans, and project budgets which could break aggregate calculations or lead to invalid application state.
-- ============================================================

-- UP
ALTER TABLE invoices ADD CONSTRAINT invoices_vat_check CHECK (vat >= 0) NOT VALID;
ALTER TABLE recurring_invoices ADD CONSTRAINT recurring_invoices_vat_check CHECK (vat >= 0) NOT VALID;
ALTER TABLE receipt_scans ADD CONSTRAINT receipt_scans_vat_check CHECK (vat >= 0) NOT VALID;
ALTER TABLE projects ADD CONSTRAINT projects_budget_check CHECK (budget >= 0) NOT VALID;
/*
-- DOWN Migration:
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_vat_check;
ALTER TABLE recurring_invoices DROP CONSTRAINT IF EXISTS recurring_invoices_vat_check;
ALTER TABLE receipt_scans DROP CONSTRAINT IF EXISTS receipt_scans_vat_check;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_budget_check;
*/
