ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_exchange_rate_check;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_exchange_rate_check;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_exchange_rate_check;
ALTER TABLE overtime_records DROP CONSTRAINT IF EXISTS overtime_records_rate_check;
ALTER TABLE mileage_entries DROP CONSTRAINT IF EXISTS mileage_entries_rate_per_km_check;
ALTER TABLE tax_filings DROP CONSTRAINT IF EXISTS tax_filings_tax_rate_check;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_unit_cost_check;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_total_cost_check;
