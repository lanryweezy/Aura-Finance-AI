-- ============================================================
-- Migration: Add CHECK constraints to date columns
-- Gap Closed: Ensures that logically ordered dates are valid.
-- Invalid state prevented: storing end_date before start_date, which would break logical timeline and duration calculations.
-- ============================================================

-- UP
ALTER TABLE projects ADD CONSTRAINT projects_date_check CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_date_check CHECK (end_date >= start_date);

-- DOWN
-- ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_date_check;
-- ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_date_check;
