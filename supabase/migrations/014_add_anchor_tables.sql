-- 014_add_anchor_tables.sql
-- Add tables to track Anchor integration state.

-- Anchor Customers
CREATE TABLE IF NOT EXISTS anchor_customers (
    id text primary key default ('anc_cst_' || replace(uuid_generate_v4()::text, '-', '')),
    anchor_id text not null unique,
    type text not null, -- 'IndividualCustomer' | 'BusinessCustomer'
    user_id text, -- link to aura user if applicable
    business_id text, -- link to aura business if applicable
    status text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Anchor Accounts
CREATE TABLE IF NOT EXISTS anchor_accounts (
    id text primary key default ('anc_acc_' || replace(uuid_generate_v4()::text, '-', '')),
    anchor_id text not null unique,
    customer_id text references anchor_customers(anchor_id),
    product_name text not null,
    status text not null,
    virtual_nuban_id text,
    account_number text,
    account_name text,
    bank_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Anchor Transfers
CREATE TABLE IF NOT EXISTS anchor_transfers (
    id text primary key default ('anc_trsf_' || replace(uuid_generate_v4()::text, '-', '')),
    anchor_id text not null unique,
    reference text not null unique,
    amount integer not null check (amount > 0), -- Amount in kobo
    currency text not null default 'NGN',
    status text not null,
    source_account_id text references anchor_accounts(anchor_id),
    destination_counterparty_id text,
    reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Anchor Webhook Events (for idempotency)
CREATE TABLE IF NOT EXISTS anchor_webhook_events (
    id text primary key default ('anc_evt_' || replace(uuid_generate_v4()::text, '-', '')),
    event_id text not null unique, -- from anchor payload
    type text not null,
    payload jsonb not null,
    processed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

/*
-- DOWN MIGRATION --
DROP TABLE IF EXISTS anchor_webhook_events;
DROP TABLE IF EXISTS anchor_transfers;
DROP TABLE IF EXISTS anchor_accounts;
DROP TABLE IF EXISTS anchor_customers;
*/
