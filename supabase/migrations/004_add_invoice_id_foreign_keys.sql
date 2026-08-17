-- ============================================================
-- Migration: Add missing foreign keys for invoice_id
-- Gap Closed: Ensures `invoice_id` references valid `invoices`.
-- Invalid state prevented: orphaned partial payments, credit notes, nrs submissions and client portal links when an invoice is deleted.
-- ============================================================

-- UP
-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE partial_payments ADD CONSTRAINT partial_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE credit_notes ADD CONSTRAINT credit_notes_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE nrs_submissions ADD CONSTRAINT nrs_submissions_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE client_portal_links ADD CONSTRAINT client_portal_links_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE NOT VALID;

-- Note: In a subsequent deploy, we will need to run VALIDATE CONSTRAINT after handling existing violations.
