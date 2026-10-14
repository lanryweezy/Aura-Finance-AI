-- ============================================================
-- Migration: Add missing CHECK constraints for rate and cost amounts
-- Gap Closed: Ensures that financial rates and costs cannot be negative.
-- Invalid state prevented: Storing negative exchange rates, overtime rates, mileage rates, tax rates, or item costs, which would break financial calculations and aggregations.
-- ============================================================

ALTER TABLE transactions ADD CONSTRAINT transactions_exchange_rate_check CHECK (exchange_rate >= 0) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_exchange_rate_check CHECK (exchange_rate >= 0) NOT VALID;
ALTER TABLE bills ADD CONSTRAINT bills_exchange_rate_check CHECK (exchange_rate >= 0) NOT VALID;
ALTER TABLE overtime_records ADD CONSTRAINT overtime_records_rate_check CHECK (rate >= 0) NOT VALID;
ALTER TABLE mileage_entries ADD CONSTRAINT mileage_entries_rate_per_km_check CHECK (rate_per_km >= 0) NOT VALID;
ALTER TABLE tax_filings ADD CONSTRAINT tax_filings_tax_rate_check CHECK (tax_rate >= 0) NOT VALID;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_unit_cost_check CHECK (unit_cost >= 0) NOT VALID;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_total_cost_check CHECK (total_cost >= 0) NOT VALID;
