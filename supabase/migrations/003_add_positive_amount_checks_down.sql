-- DOWN
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_gross_salary_check;
ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_salvage_value_check;
ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_purchase_cost_check;
ALTER TABLE salary_advances DROP CONSTRAINT IF EXISTS salary_advances_amount_check;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_amount_check;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_amount_check;
