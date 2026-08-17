-- DOWN
ALTER TABLE client_portal_links DROP CONSTRAINT IF EXISTS client_portal_links_invoice_id_fkey;
ALTER TABLE nrs_submissions DROP CONSTRAINT IF EXISTS nrs_submissions_invoice_id_fkey;
ALTER TABLE credit_notes DROP CONSTRAINT IF EXISTS credit_notes_invoice_id_fkey;
ALTER TABLE partial_payments DROP CONSTRAINT IF EXISTS partial_payments_invoice_id_fkey;
