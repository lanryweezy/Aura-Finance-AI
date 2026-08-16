-- ============================================================
-- Migration: Add CHECK constraints to numeric amount columns
-- Gap Closed: Ensures that financial amounts cannot be negative.
-- Invalid state prevented: storing negative budgets, expenses, transactions, salaries, which would break financial calculations.
-- ============================================================

-- UP
ALTER TABLE budgets ADD CONSTRAINT budgets_amount_check CHECK (amount >= 0);
ALTER TABLE expenses ADD CONSTRAINT expenses_amount_check CHECK (amount >= 0);
ALTER TABLE salary_advances ADD CONSTRAINT salary_advances_amount_check CHECK (amount >= 0);
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_purchase_cost_check CHECK (purchase_cost >= 0);
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_salvage_value_check CHECK (salvage_value >= 0);
ALTER TABLE employees ADD CONSTRAINT employees_gross_salary_check CHECK (gross_salary >= 0);
