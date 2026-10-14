-- ============================================================
-- Migration: Add missing CHECK constraints for fixed_assets
-- Gap Closed: Ensures that financial amounts and years related to fixed assets cannot be negative.
-- Invalid state prevented: Storing negative useful life, disposal price, accumulated depreciation, or book value, which would break financial calculations and aggregations.
-- ============================================================

-- UP
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_useful_life_years_check CHECK (useful_life_years >= 0) NOT VALID;
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_disposal_price_check CHECK (disposal_price >= 0) NOT VALID;
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_accumulated_depreciation_check CHECK (accumulated_depreciation >= 0) NOT VALID;
ALTER TABLE fixed_assets ADD CONSTRAINT fixed_assets_book_value_check CHECK (book_value >= 0) NOT VALID;

/*
-- DOWN
ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_useful_life_years_check;
ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_disposal_price_check;
ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_accumulated_depreciation_check;
ALTER TABLE fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_book_value_check;
*/
