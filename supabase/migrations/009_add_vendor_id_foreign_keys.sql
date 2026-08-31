-- Migration: Add missing foreign keys for vendor_id
-- Gap Closed: Ensures `vendor_id` in `vendor_portal_links` references valid `contacts`.
ALTER TABLE vendor_portal_links ADD CONSTRAINT vendor_portal_links_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES contacts(id) ON DELETE CASCADE NOT VALID;

/*
-- DOWN Migration
ALTER TABLE vendor_portal_links DROP CONSTRAINT IF EXISTS vendor_portal_links_vendor_id_fkey;
*/
