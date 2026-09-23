-- ============================================================
-- Migration: Add CHECK constraint to fixed assets disposal date
-- Gap Closed: Ensures that the disposal date is logically after or equal to the purchase date.
-- Invalid state prevented: A fixed asset being disposed of before it was even purchased, leading to impossible timelines.
-- ============================================================

ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_disposal_date_check CHECK (disposal_date >= purchase_date) NOT VALID;

/*
-- DOWN Migration:
ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_disposal_date_check;
*/
