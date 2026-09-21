-- Migration: Add foreign key for vendor_id to contacts
ALTER TABLE vendor_portal_links
  ADD CONSTRAINT vendor_portal_links_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES contacts(id) ON DELETE CASCADE NOT VALID;
