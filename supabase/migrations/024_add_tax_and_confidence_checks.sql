-- ============================================================
-- Migration: Add missing CHECK constraints for tax filings and receipt scans
-- Gap Closed: Prevents negative values in total_revenue and total_expenses in tax filings,
--             and ensures confidence score in receipt scans is within the [0, 1] range.
-- ============================================================

-- UP
ALTER TABLE tax_filings ADD CONSTRAINT tax_filings_total_revenue_check CHECK (total_revenue >= 0) NOT VALID;
ALTER TABLE tax_filings ADD CONSTRAINT tax_filings_total_expenses_check CHECK (total_expenses >= 0) NOT VALID;
ALTER TABLE receipt_scans ADD CONSTRAINT receipt_scans_confidence_range_check CHECK (confidence >= 0 AND confidence <= 1) NOT VALID;

-- DOWN
-- ALTER TABLE tax_filings DROP CONSTRAINT IF EXISTS tax_filings_total_revenue_check;
-- ALTER TABLE tax_filings DROP CONSTRAINT IF EXISTS tax_filings_total_expenses_check;
-- ALTER TABLE receipt_scans DROP CONSTRAINT IF EXISTS receipt_scans_confidence_range_check;
