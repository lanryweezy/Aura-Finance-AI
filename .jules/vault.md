## 2024-05-30 - Missing Check Constraints on Financial Amounts
**Learning:** The database schema has numeric amount columns in multiple tables (e.g. `budgets.amount`, `expenses.amount`, `salary_advances.amount`, `fixed_assets.purchase_cost`, `employees.gross_salary`) without any database-level CHECK constraints to ensure they are not negative. Because there's no check constraint, invalid state could be introduced (e.g. negative salaries or budgets) which would corrupt financial aggregation queries.
**Action:** Added new schema migration (003) to introduce CHECK constraints to ensure these critical numeric columns are always >= 0.
## 2024-05-30 - Missing Foreign Key Constraints on HR Tables
**Learning:** Tables storing HR information (`salary_advances`, `mileage_entries`, `leave_balances`, `leave_requests`, `overtime_records`) had an `employee_id` column assumed by the application to reference the `employees` table, but lacked database-level `FOREIGN KEY` constraints. This could lead to orphaned records if an employee was deleted.
**Action:** Added migration (005) to safely enforce `FOREIGN KEY` relationships with `ON DELETE CASCADE NOT VALID` to prevent locking or downtime while enforcing data consistency.
## 2024-05-30 - Missing Foreign Key Constraints on User Tables
**Learning:** Tables storing user-related information (`user_permissions`, `audit_logs_v2`, `active_sessions`) had a `user_id` column assumed by the application to reference the `users` table, but lacked database-level `FOREIGN KEY` constraints. This could lead to orphaned permissions or session records if a user was deleted.
**Action:** Added migration (006) to safely enforce `FOREIGN KEY` relationships with `ON DELETE CASCADE NOT VALID` to prevent locking or downtime while enforcing data consistency.
## 2026-08-23 - Missing Foreign Key Constraints on Reconciliation Tables\n**Learning:** The `reconciliations` and `reconciliation_sessions` tables contained a `bank_account_id` column assumed to reference the `bank_connections` table, but lacked database-level `FOREIGN KEY` constraints. This gap could result in orphaned reconciliation records if a bank connection is deleted.\n**Action:** Added migration (007) to safely enforce `FOREIGN KEY` relationships with `ON DELETE CASCADE NOT VALID` to ensure consistent deletion of associated reconciliation sessions and records without causing table locks or downtime.

## 2023-10-25 - Supabase CLI Migration Down File Handling
**Learning:** The Supabase CLI executes all `.sql` files in a migration directory sequentially based on filename. Creating a separate `_down.sql` file in the same directory causes it to be executed immediately after the `up` migration, instantly reverting the changes.
**Action:** When creating reversible database schema migrations in Supabase, DO NOT create separate `_down.sql` files. Instead, embed the `DOWN` migration logic as a commented block at the bottom of the main `.sql` migration file so it serves as documentation and manual rollback reference without breaking the automated migration run.
## 2024-05-30 - Missing Check Constraints on Temporal Data (Date Ranges)
**Learning:** The database schema has multiple tables containing temporal date ranges or bounds (`projects.start_date`/`end_date`, `invoices.issue_date`/`due_date`, etc.) without database-level CHECK constraints to ensure logical ordering (e.g., end dates appearing before start dates). Without this, the data layer could store paradoxes that break application timelines.
**Action:** Added migration (010) to introduce CHECK constraints enforcing temporal logic across all date-range tables, utilizing the `NOT VALID` clause to prevent table locking while ensuring new rows respect the bounds.
## 2025-05-15 - Fixed Assets Disposal Date Integrity
**Learning:** Fixed assets can have a `disposal_date` that is logically before their `purchase_date` if not constrained, leading to impossible timelines.
**Action:** Added a CHECK constraint `disposal_date >= purchase_date` to enforce logical temporal ordering for fixed asset disposal.
## 2024-05-30 - Missing Foreign Key Constraints on User Tables (Remaining)
**Learning:** Tables storing references to users (`projects.manager`, `closing_periods.closed_by`, `corporate_cards.assigned_to`, `approval_requests.requested_by`, `expenses.submitted_by`, `expenses.approved_by`, `stock_movements.created_by`, `partial_payments.recorded_by`, `credit_notes.issued_by`, `leave_requests.approved_by`) lacked database-level `FOREIGN KEY` constraints linking them to the `users(id)` column. This could lead to orphaned records or the insertion of records referencing non-existent users if a user was deleted.
**Action:** Added migration (011) to safely enforce `FOREIGN KEY` relationships with `ON DELETE SET NULL NOT VALID` or `ON DELETE CASCADE NOT VALID` (depending on the criticality of the relationship) to prevent locking or downtime while enforcing data consistency.
## 2024-10-27 - Lifecycle Timestamps without Temporal Constraints
**Learning:** Database architectures utilizing multiple independent timestamp columns for lifecycle states (e.g., `created_at`, `started_at`, `completed_at`, `filed_at`) frequently lack check constraints enforcing chronological integrity. This allows states where events conclude before they begin.
**Action:** When auditing schemas with lifecycle states, always write migrations containing `CHECK (completed_at >= created_at)` constraints to guarantee mathematical non-negativity in derived duration metrics and prevent impossible state timelines.
## 2025-05-24 - Missing CHECK constraints for HR/leave tracking tables
**Learning:** Leave balances in HR tracking tables (e.g. `annual`, `sick`, `remaining`, `used`) often lack CHECK constraints because applications use default values or perform validation only during request time. However, direct imports, buggy manual edits, or application-layer bypassing could inject negative values, causing logic flaws where employees have effectively negative leaves, altering duration and payroll calculations unexpectedly.
**Action:** Always add non-negative CHECK constraints `CHECK (column >= 0)` when storing balances representing physical constraints (like days of leave, quantities, or allocations). Apply with `NOT VALID` if existing data has a risk of violating the constraint.

## 2023-10-05 - HR Negative values constraints
**Learning:** HR tables like leave_requests and salary_advances could allow corrupt states via negative days or negative repayment_months if checks were not present.
**Action:** Created constraints using NOT VALID to safely apply to existing schema without requiring locking scans.

## 2024-10-27 - Missing Check Constraints on Totals
**Learning:** Tables with total columns like `estimates`, `purchase_orders`, `receipt_scans`, and `client_portal_links` lacked check constraints to ensure their total amounts were non-negative. If left unconstrained, these could inadvertently store negative totals, corrupting subsequent invoice calculations or analytical aggregates.
**Action:** Added `total >= 0` or `total_amount >= 0` check constraints to these tables using `NOT VALID` to prevent invalid states from being introduced.
