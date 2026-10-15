-- ============================================================
-- DOWN Migration: Remove CHECK constraints for corporate_cards
-- ============================================================

ALTER TABLE corporate_cards DROP CONSTRAINT IF EXISTS corporate_cards_spend_limit_check;
ALTER TABLE corporate_cards DROP CONSTRAINT IF EXISTS corporate_cards_spent_amount_check;
