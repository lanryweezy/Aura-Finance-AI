-- Add a CHECK constraint to ensure AI confidence scores are between 0 and 1
ALTER TABLE receipt_scans
  ADD CONSTRAINT receipt_scans_confidence_check
  CHECK (confidence >= 0 AND confidence <= 1) NOT VALID;
