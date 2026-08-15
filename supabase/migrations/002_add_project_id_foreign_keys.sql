-- ============================================================
-- Migration: Add missing foreign keys for project_id
-- Gap Closed: Ensures `project_id` references valid `projects`.
-- Invalid state prevented: orphaned project associations when a project is deleted.
-- ============================================================

-- UP
-- 1. First, set project_id to NULL for any orphaned records to ensure the constraints can be added safely.
UPDATE transactions SET project_id = NULL WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects);
UPDATE invoices SET project_id = NULL WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects);
UPDATE bills SET project_id = NULL WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects);
UPDATE purchase_orders SET project_id = NULL WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects);
UPDATE estimates SET project_id = NULL WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects);
UPDATE expenses SET project_id = NULL WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects);
UPDATE recurring_invoices SET project_id = NULL WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects);

-- 2. Add the constraints safely
ALTER TABLE transactions ADD CONSTRAINT transactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD CONSTRAINT invoices_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE bills ADD CONSTRAINT bills_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE estimates ADD CONSTRAINT estimates_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD CONSTRAINT expenses_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE recurring_invoices ADD CONSTRAINT recurring_invoices_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- DOWN
-- ALTER TABLE recurring_invoices DROP CONSTRAINT IF EXISTS recurring_invoices_project_id_fkey;
-- ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_project_id_fkey;
-- ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_project_id_fkey;
-- ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_project_id_fkey;
-- ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_project_id_fkey;
-- ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_project_id_fkey;
-- ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_project_id_fkey;
