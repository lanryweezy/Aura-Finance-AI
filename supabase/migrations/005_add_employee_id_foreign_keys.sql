-- ============================================================
-- Migration: Add missing foreign keys for employee_id
-- Gap Closed: Ensures `employee_id` references valid `employees`.
-- Invalid state prevented: orphaned HR records (leave, overtime, advances, mileage) when an employee is deleted, or insertion of HR records for non-existent employees.
-- ============================================================

-- UP
-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE salary_advances ADD CONSTRAINT salary_advances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE mileage_entries ADD CONSTRAINT mileage_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE overtime_records ADD CONSTRAINT overtime_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE NOT VALID;

-- Note: In a subsequent deploy, we will need to run VALIDATE CONSTRAINT after handling existing violations.
