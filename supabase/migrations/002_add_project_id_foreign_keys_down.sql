-- ============================================================
-- DOWN Migration: Add missing foreign keys for project_id
-- ============================================================

ALTER TABLE recurring_invoices DROP CONSTRAINT IF EXISTS recurring_invoices_project_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_project_id_fkey;
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_project_id_fkey;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_project_id_fkey;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_project_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_project_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_project_id_fkey;
