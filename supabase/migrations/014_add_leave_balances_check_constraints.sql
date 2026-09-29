-- ============================================================
-- Migration: Add missing CHECK constraints for leave balances
-- Gap Closed: Prevents negative values in leave balances (annual, sick, maternity, paternity, compassionate, used, remaining) which could allow employees to take more leave than they are entitled to, breaking HR and payroll calculations.
-- ============================================================

-- UP
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_annual_check CHECK (annual >= 0) NOT VALID;
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_sick_check CHECK (sick >= 0) NOT VALID;
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_maternity_check CHECK (maternity >= 0) NOT VALID;
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_paternity_check CHECK (paternity >= 0) NOT VALID;
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_compassionate_check CHECK (compassionate >= 0) NOT VALID;
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_used_check CHECK (used >= 0) NOT VALID;
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_remaining_check CHECK (remaining >= 0) NOT VALID;

/*
-- DOWN
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS leave_balances_annual_check;
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS leave_balances_sick_check;
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS leave_balances_maternity_check;
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS leave_balances_paternity_check;
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS leave_balances_compassionate_check;
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS leave_balances_used_check;
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS leave_balances_remaining_check;
*/
