-- DOWN
ALTER TABLE salary_advances DROP CONSTRAINT IF EXISTS salary_advances_employee_id_fkey;
ALTER TABLE mileage_entries DROP CONSTRAINT IF EXISTS mileage_entries_employee_id_fkey;
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS leave_balances_employee_id_fkey;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_employee_id_fkey;
ALTER TABLE overtime_records DROP CONSTRAINT IF EXISTS overtime_records_employee_id_fkey;
