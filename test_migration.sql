-- UP
UPDATE overtime_records SET employee_id = NULL WHERE employee_id IS NOT NULL AND employee_id NOT IN (SELECT id FROM employees);
UPDATE leave_requests SET employee_id = NULL WHERE employee_id IS NOT NULL AND employee_id NOT IN (SELECT id FROM employees);
UPDATE leave_balances SET employee_id = NULL WHERE employee_id IS NOT NULL AND employee_id NOT IN (SELECT id FROM employees);
UPDATE mileage_entries SET employee_id = NULL WHERE employee_id IS NOT NULL AND employee_id NOT IN (SELECT id FROM employees);
UPDATE salary_advances SET employee_id = NULL WHERE employee_id IS NOT NULL AND employee_id NOT IN (SELECT id FROM employees);

ALTER TABLE overtime_records ADD CONSTRAINT overtime_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE leave_balances ADD CONSTRAINT leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE mileage_entries ADD CONSTRAINT mileage_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE salary_advances ADD CONSTRAINT salary_advances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
