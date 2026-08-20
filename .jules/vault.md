## 2024-05-30 - Missing Check Constraints on Financial Amounts
**Learning:** The database schema has numeric amount columns in multiple tables (e.g. `budgets.amount`, `expenses.amount`, `salary_advances.amount`, `fixed_assets.purchase_cost`, `employees.gross_salary`) without any database-level CHECK constraints to ensure they are not negative. Because there's no check constraint, invalid state could be introduced (e.g. negative salaries or budgets) which would corrupt financial aggregation queries.
**Action:** Added new schema migration (003) to introduce CHECK constraints to ensure these critical numeric columns are always >= 0.
## 2024-05-30 - Missing Foreign Key Constraints on HR Tables
**Learning:** Tables storing HR information (`salary_advances`, `mileage_entries`, `leave_balances`, `leave_requests`, `overtime_records`) had an `employee_id` column assumed by the application to reference the `employees` table, but lacked database-level `FOREIGN KEY` constraints. This could lead to orphaned records if an employee was deleted.
**Action:** Added migration (005) to safely enforce `FOREIGN KEY` relationships with `ON DELETE CASCADE NOT VALID` to prevent locking or downtime while enforcing data consistency.
## 2024-05-30 - Missing Foreign Key Constraints on User Tables
**Learning:** Tables storing user-related information (`user_permissions`, `audit_logs_v2`, `active_sessions`) had a `user_id` column assumed by the application to reference the `users` table, but lacked database-level `FOREIGN KEY` constraints. This could lead to orphaned permissions or session records if a user was deleted.
**Action:** Added migration (006) to safely enforce `FOREIGN KEY` relationships with `ON DELETE CASCADE NOT VALID` to prevent locking or downtime while enforcing data consistency.
