-- 014_enhance_corporate_cards.sql

-- DOWN MIGRATION (commented out)
/*
ALTER TABLE corporate_cards
  DROP COLUMN provider,
  DROP COLUMN provider_card_id,
  DROP COLUMN owner_type,
  DROP COLUMN owner_id,
  DROP COLUMN department_id,
  DROP COLUMN employee_id,
  DROP COLUMN project_id,
  DROP COLUMN purpose,
  DROP COLUMN card_type,
  DROP COLUMN frequency_limit,
  DROP COLUMN budget_id,
  DROP COLUMN cost_center_id,
  DROP COLUMN accounting_category,
  DROP COLUMN expiry_date,
  DROP COLUMN metadata;
*/

ALTER TABLE corporate_cards
  ADD COLUMN provider text,
  ADD COLUMN provider_card_id text,
  ADD COLUMN owner_type text CHECK (owner_type IN ('EMPLOYEE', 'DEPARTMENT', 'PROJECT', 'VENDOR', 'SYSTEM', 'AI_AGENT')),
  ADD COLUMN owner_id text,
  ADD COLUMN department_id text,
  ADD COLUMN employee_id text,
  ADD COLUMN project_id text,
  ADD COLUMN purpose text,
  ADD COLUMN card_type text,
  ADD COLUMN frequency_limit text,
  ADD COLUMN budget_id text,
  ADD COLUMN cost_center_id text,
  ADD COLUMN accounting_category text,
  ADD COLUMN expiry_date timestamptz,
  ADD COLUMN metadata jsonb;
