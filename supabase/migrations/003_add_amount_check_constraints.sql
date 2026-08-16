-- ============================================================
-- Migration: Add CHECK constraints to numeric amount columns
-- Gap Closed: Ensures that financial amounts cannot be negative.
-- Invalid state prevented: storing negative budgets, expenses, transactions, salaries, which would break financial calculations.
-- ============================================================

-- UP
ALTER TABLE transactions ADD CONSTRAINT transactions_amount_check CHECK (amount >= 0);
ALTER TABLE invoices ADD CONSTRAINT invoices_amount_check CHECK (amount >= 0);
ALTER TABLE bills ADD CONSTRAINT bills_amount_check CHECK (amount >= 0);
ALTER TABLE expenses ADD CONSTRAINT expenses_amount_check CHECK (amount >= 0);
ALTER TABLE budgets ADD CONSTRAINT budgets_amount_check CHECK (amount >= 0);
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_purchase_cost_check CHECK (purchase_cost >= 0);
ALTER TABLE employees ADD CONSTRAINT employees_gross_salary_check CHECK (gross_salary >= 0);
ALTER TABLE salaries_advances ADD CONSTRAINT salary_advances_amount_check CHECK (amount >= 0);
-- Wait, let me query the schema again
