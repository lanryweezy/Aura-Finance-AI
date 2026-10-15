-- ============================================================
-- Migration: Add missing CHECK constraints for corporate_cards
-- Gap Closed: Prevents negative values in spend_limit and spent_amount which could break aggregate calculations or lead to invalid application state.
-- ============================================================

-- UP
-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE corporate_cards ADD CONSTRAINT corporate_cards_spend_limit_check CHECK (spend_limit >= 0) NOT VALID;
ALTER TABLE corporate_cards ADD CONSTRAINT corporate_cards_spent_amount_check CHECK (spent_amount >= 0) NOT VALID;

-- Note: In a subsequent deploy, we will need to run VALIDATE CONSTRAINT after handling existing violations.
