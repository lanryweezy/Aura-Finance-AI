-- ============================================================
-- Migration: Add missing CHECK constraints for approval policies
-- Gap Closed: Prevents negative values in min_amount and ensures max_amount is greater than or equal to min_amount when provided.
-- ============================================================

-- UP
ALTER TABLE approval_policies ADD CONSTRAINT approval_policies_min_amount_check CHECK (min_amount >= 0) NOT VALID;
ALTER TABLE approval_policies VALIDATE CONSTRAINT approval_policies_min_amount_check;

ALTER TABLE approval_policies ADD CONSTRAINT approval_policies_max_amount_check CHECK (max_amount IS NULL OR max_amount >= min_amount) NOT VALID;
ALTER TABLE approval_policies VALIDATE CONSTRAINT approval_policies_max_amount_check;

/*
-- DOWN
ALTER TABLE approval_policies DROP CONSTRAINT IF EXISTS approval_policies_min_amount_check;
ALTER TABLE approval_policies DROP CONSTRAINT IF EXISTS approval_policies_max_amount_check;
*/
