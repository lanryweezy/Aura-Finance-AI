💡 What: Added database-level CHECK constraints to enforce logical temporal ordering on date range columns across 6 tables (e.g. `end_date >= start_date`, `due_date >= issue_date`).

🎯 Why: To strictly prevent applications from saving invalid chronological timeline states. If a bug ever allowed a project to end before it started, or an invoice to be due before it was issued, financial calculations and dashboards would break.

🗃️ Migration: Includes a new migration `supabase/migrations/010_add_date_range_check_constraints.sql`. The migration is fully reversible, with the DOWN migration logic safely embedded in comments.

⚠️ Deploy notes: The constraints are added with the `NOT VALID` clause, which means it will apply to new records instantly but won't trigger full table locks or crash the migration if some legacy data already violates the rule.

✅ Verification: The constraints enforce logical dates at the database schema level. They have been verified and do not introduce regressions into the test suites.
