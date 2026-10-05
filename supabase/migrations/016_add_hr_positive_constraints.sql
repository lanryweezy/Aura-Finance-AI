-- ============================================================
-- Migration: Add CHECK constraints to HR numeric columns
-- Gap Closed: Ensures that days, monthly deductions and repayment months cannot be negative.
-- Invalid state prevented: storing negative leave days or salary deductions, which would break payroll calculations.
-- ============================================================

-- UP
ALTER TABLE salary_advances ADD CONSTRAINT salary_advances_repayment_months_check CHECK (repayment_months >= 0) NOT VALID;
ALTER TABLE salary_advances ADD CONSTRAINT salary_advances_monthly_deduction_check CHECK (monthly_deduction >= 0) NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_days_check CHECK (days >= 0) NOT VALID;

/*
-- DOWN
ALTER TABLE salary_advances DROP CONSTRAINT IF EXISTS salary_advances_repayment_months_check;
ALTER TABLE salary_advances DROP CONSTRAINT IF EXISTS salary_advances_monthly_deduction_check;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_days_check;
*/
