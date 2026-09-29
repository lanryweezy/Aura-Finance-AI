-- ============================================================
-- Aura Finance AI — Anchor Integration Schema Additions
-- ============================================================

-- ============== ANCHOR CUSTOMERS ==============
create table anchor_customers (
  id text primary key default ('acust_' || replace(uuid_generate_v4()::text, '-', '')),
  anchor_customer_id text not null unique,
  organization_id text not null references organizations(id) on delete cascade,
  aura_contact_id text references contacts(id) on delete set null,
  customer_type text not null check (customer_type in ('individual', 'business')),
  verification_status text default 'pending',
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============== ANCHOR ACCOUNTS ==============
create table anchor_accounts (
  id text primary key default ('aacc_' || replace(uuid_generate_v4()::text, '-', '')),
  anchor_account_id text not null unique,
  organization_id text not null references organizations(id) on delete cascade,
  anchor_customer_id text not null references anchor_customers(anchor_customer_id) on delete cascade,
  account_type text not null check (account_type in ('deposit', 'reserved', 'subaccount')),
  account_number text,
  bank_name text,
  available_balance numeric(15,2) default 0,
  ledger_balance numeric(15,2) default 0,
  currency text default 'NGN',
  status text not null default 'pending',
  aura_invoice_id text references invoices(id) on delete set null,
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============== ANCHOR TRANSFERS ==============
create table anchor_transfers (
  id text primary key default ('atrf_' || replace(uuid_generate_v4()::text, '-', '')),
  anchor_transfer_id text unique, -- Can be null initially until Anchor returns the ID
  organization_id text not null references organizations(id) on delete cascade,
  source_account_id text not null,
  destination_account text not null,
  destination_bank text,
  amount numeric(15,2) not null check (amount >= 0),
  currency text default 'NGN',
  status text not null default 'pending',
  reference text unique not null,
  narration text,
  error_message text,
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============== ANCHOR WEBHOOK EVENTS ==============
create table anchor_webhook_events (
  id text primary key default ('awe_' || replace(uuid_generate_v4()::text, '-', '')),
  event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processed', 'failed')),
  error_message text,
  created_at timestamptz default now(),
  processed_at timestamptz
);

-- DOWN MIGRATION (Embedded)
-- /*
-- drop table if exists anchor_webhook_events;
-- drop table if exists anchor_transfers;
-- drop table if exists anchor_accounts;
-- drop table if exists anchor_customers;
-- */
