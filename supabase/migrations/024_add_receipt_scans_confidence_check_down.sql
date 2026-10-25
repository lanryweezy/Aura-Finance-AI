-- Remove the CHECK constraint on AI confidence scores
ALTER TABLE receipt_scans
  DROP CONSTRAINT IF EXISTS receipt_scans_confidence_check;
