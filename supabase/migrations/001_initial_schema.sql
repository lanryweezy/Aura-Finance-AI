-- ============================================================
-- Aura Finance AI — Initial Database Schema
-- Run this in Supabase SQL Editor or via CLI migrations
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============== ORGANIZATIONS ==============
create table organizations (
  id text primary key default ('org_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  plan text not null default 'Free' check (plan in ('Free', 'Growth', 'Enterprise')),
  tin text,
  two_factor_enabled boolean default false,
  ip_whitelist text[] default '{}',
  session_timeout integer default 30,
  encryption_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============== USERS ==============
create table users (
  id text primary key default ('u_' || replace(uuid_generate_v4()::text, '-', '')),
  email text unique not null,
  name text not null,
  role text not null default 'Viewer' check (role in ('Owner', 'Admin', 'Viewer')),
  organization_id text not null references organizations(id) on delete cascade,
  avatar_url text,
  current_entity_id text,
  created_at timestamptz default now()
);

-- ============== ENTITIES (Multi-entity support) ==============
create table entities (
  id text primary key default ('ent_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  type text not null default 'Main' check (type in ('Subsidiary', 'Branch', 'Department', 'Main')),
  tax_id text,
  currency text not null default 'NGN',
  is_main boolean default false,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== CHART OF ACCOUNTS ==============
create table accounts (
  id text primary key default ('acc_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  type text not null check (type in ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  description text,
  code text,
  organization_id text not null references organizations(id) on delete cascade,
  entity_id text references entities(id) on delete set null,
  created_at timestamptz default now(),
  unique(name, organization_id)
);

-- ============== BANK CONNECTIONS ==============
create table bank_connections (
  id text primary key default ('conn_' || replace(uuid_generate_v4()::text, '-', '')),
  provider text not null check (provider in ('mono', 'okra')),
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  last_synced timestamptz default now(),
  currency text default 'NGN',
  balance numeric(15,2) default 0,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== TRANSACTIONS ==============
create table transactions (
  id text primary key,
  amount numeric(15,2) not null,
  type text not null check (type in ('debit', 'credit')),
  date timestamptz not null,
  narration text not null,
  balance numeric(15,2),
  currency text default 'NGN',
  exchange_rate numeric(10,6) default 1,
  category text default 'Uncategorized',
  project_id text,
  receipt_url text,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== CONTACTS (CRM) ==============
create table contacts (
  id text primary key default ('cont_' || replace(uuid_generate_v4()::text, '-', '')),
  type text not null check (type in ('Customer', 'Vendor')),
  name text not null,
  company_name text,
  email text not null,
  phone text,
  address text,
  tin text,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== PROJECTS ==============
create table projects (
  id text primary key default ('proj_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  description text,
  start_date timestamptz,
  end_date timestamptz,
  budget numeric(15,2),
  manager text,
  status text not null default 'Active' check (status in ('Active', 'Completed', 'On Hold')),
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== INVOICES (Receivables) ==============
create table invoices (
  id text primary key default ('inv_' || replace(uuid_generate_v4()::text, '-', '')),
  customer text not null,
  description text,
  amount numeric(15,2) not null,
  vat numeric(15,2) default 0,
  total numeric(15,2) not null,
  issue_date timestamptz default now(),
  due_date timestamptz not null,
  status text not null default 'Unpaid' check (status in ('Paid', 'Unpaid', 'Overdue', 'Draft')),
  wht_applied boolean default false,
  line_items jsonb default '[]',
  project_id text,
  currency text default 'NGN',
  exchange_rate numeric(10,6) default 1,
  is_recurring boolean default false,
  recurring_schedule jsonb,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== BILLS (Payables) ==============
create table bills (
  id text primary key default ('bill_' || replace(uuid_generate_v4()::text, '-', '')),
  vendor text not null,
  description text,
  amount numeric(15,2) not null,
  issue_date timestamptz default now(),
  due_date timestamptz not null,
  status text not null default 'Unpaid' check (status in ('Paid', 'Unpaid', 'Overdue', 'Draft')),
  wht_applies boolean default false,
  line_items jsonb default '[]',
  project_id text,
  currency text default 'NGN',
  exchange_rate numeric(10,6) default 1,
  is_recurring boolean default false,
  recurring_schedule jsonb,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== EMPLOYEES ==============
create table employees (
  id text primary key default ('emp_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  job_title text not null,
  hire_date timestamptz not null,
  email text not null,
  bank_name text not null,
  account_number text not null,
  gross_salary numeric(15,2) not null,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== PAYROLL RUNS ==============
create table payroll_runs (
  id text primary key default ('pr_' || replace(uuid_generate_v4()::text, '-', '')),
  run_date timestamptz not null,
  period text not null,
  summary jsonb not null,
  payslips jsonb not null,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== JOURNAL ENTRIES ==============
create table journal_entries (
  id text primary key default ('je_' || replace(uuid_generate_v4()::text, '-', '')),
  date timestamptz default now(),
  narration text not null,
  lines jsonb not null,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== INVENTORY ==============
create table inventory (
  id text primary key default ('inv_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  sku text not null,
  category text not null,
  type text not null check (type in ('Product', 'Service')),
  cost_price numeric(15,2) not null,
  sale_price numeric(15,2) not null,
  quantity integer default 0,
  lots jsonb default '[]',
  valuation_method text default 'Average' check (valuation_method in ('FIFO', 'LIFO', 'Average')),
  warehouse_balances jsonb default '{}',
  low_stock_threshold integer,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== WAREHOUSES ==============
create table warehouses (
  id text primary key default ('wh_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  location text not null,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== PURCHASE ORDERS ==============
create table purchase_orders (
  id text primary key default ('po_' || replace(uuid_generate_v4()::text, '-', '')),
  vendor text not null,
  issue_date timestamptz default now(),
  expected_delivery_date timestamptz not null,
  status text not null default 'Draft' check (status in ('Draft', 'Sent', 'Completed', 'Cancelled')),
  line_items jsonb default '[]',
  total numeric(15,2) not null,
  project_id text,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== ESTIMATES ==============
create table estimates (
  id text primary key default ('est_' || replace(uuid_generate_v4()::text, '-', '')),
  customer text not null,
  issue_date timestamptz default now(),
  expiry_date timestamptz not null,
  status text not null default 'Draft' check (status in ('Draft', 'Sent', 'Accepted', 'Declined')),
  line_items jsonb default '[]',
  total numeric(15,2) not null,
  project_id text,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== BUDGETS ==============
create table budgets (
  id text primary key default ('bud_' || replace(uuid_generate_v4()::text, '-', '')),
  category text not null,
  amount numeric(15,2) not null,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now(),
  unique(category, organization_id)
);

-- ============== FIXED ASSETS ==============
create table fixed_assets (
  id text primary key default ('fa_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  category text not null,
  purchase_date timestamptz not null,
  purchase_cost numeric(15,2) not null,
  salvage_value numeric(15,2) default 0,
  useful_life_years integer not null,
  depreciation_method text default 'Straight Line' check (depreciation_method in ('Straight Line', 'Declining Balance')),
  status text default 'Active' check (status in ('Active', 'Disposed')),
  disposal_date timestamptz,
  disposal_price numeric(15,2),
  accumulated_depreciation numeric(15,2) default 0,
  book_value numeric(15,2) not null,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== BANK RECONCILIATIONS ==============
create table reconciliations (
  id text primary key default ('rec_' || replace(uuid_generate_v4()::text, '-', '')),
  bank_account_id text not null,
  statement_date timestamptz not null,
  statement_ending_balance numeric(15,2) not null,
  cleared_transactions text[] default '{}',
  is_completed boolean default false,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== CLOSING PERIODS ==============
create table closing_periods (
  id text primary key default ('close_' || replace(uuid_generate_v4()::text, '-', '')),
  year integer not null,
  status text not null default 'Draft' check (status in ('Draft', 'Closed')),
  closed_at timestamptz,
  closed_by text,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== AUDIT LOG ==============
create table audit_logs (
  id text primary key default ('log_' || replace(uuid_generate_v4()::text, '-', '')),
  timestamp timestamptz default now(),
  "user" text not null,
  action text not null,
  module text,
  before_data jsonb,
  after_data jsonb,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== USAGE TRACKING ==============
create table usage_tracking (
  id text primary key default ('ut_' || replace(uuid_generate_v4()::text, '-', '')),
  organization_id text not null references organizations(id) on delete cascade,
  type text not null,
  count integer default 1,
  created_at timestamptz default now(),
  unique(organization_id, type)
);

-- ============== TEAM MEMBERS ==============
create table team_members (
  id text primary key default ('tm_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  email text not null,
  role text not null default 'Viewer',
  status text not null default 'Active' check (status in ('Active', 'Pending', 'Deactivated')),
  joined_at timestamptz default now(),
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== CUSTOM ROLES ==============
create table custom_roles (
  id text primary key default ('cr_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  permissions text[] default '{}',
  is_custom boolean default true,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== INDEXES ==============
create index idx_transactions_org on transactions(organization_id);
create index idx_transactions_date on transactions(date desc);
create index idx_transactions_category on transactions(category);
create index idx_invoices_org on invoices(organization_id);
create index idx_invoices_status on invoices(status);
create index idx_bills_org on bills(organization_id);
create index idx_bills_status on bills(status);
create index idx_employees_org on employees(organization_id);
create index idx_contacts_org on contacts(organization_id);
create index idx_journal_entries_org on journal_entries(organization_id);
create index idx_inventory_org on inventory(organization_id);
create index idx_audit_logs_org on audit_logs(organization_id);
create index idx_audit_logs_timestamp on audit_logs(timestamp desc);

-- ============== ROW LEVEL SECURITY ==============
alter table organizations enable row level security;
alter table users enable row level security;
alter table entities enable row level security;
alter table accounts enable row level security;
alter table bank_connections enable row level security;
alter table transactions enable row level security;
alter table contacts enable row level security;
alter table projects enable row level security;
alter table invoices enable row level security;
alter table bills enable row level security;
alter table employees enable row level security;
alter table payroll_runs enable row level security;
alter table journal_entries enable row level security;
alter table inventory enable row level security;
alter table warehouses enable row level security;
alter table purchase_orders enable row level security;
alter table estimates enable row level security;
alter table budgets enable row level security;
alter table fixed_assets enable row level security;
alter table reconciliations enable row level security;
alter table closing_periods enable row level security;
alter table audit_logs enable row level security;

-- ============== DEFAULT CHART OF ACCOUNTS ==============
-- Seed function: call after org creation
create or replace function seed_default_accounts(org_id text)
returns void as $$
begin
  insert into accounts (name, type, organization_id) values
    ('Sales Revenue', 'Revenue', org_id),
    ('Service Revenue', 'Revenue', org_id),
    ('Interest Income', 'Revenue', org_id),
    ('Other Income', 'Revenue', org_id),
    ('Capital Injection', 'Equity', org_id),
    ('Owner''s Draw', 'Equity', org_id),
    ('Salaries & Wages', 'Expense', org_id),
    ('Utilities', 'Expense', org_id),
    ('Software & Subscriptions', 'Expense', org_id),
    ('Marketing & Advertising', 'Expense', org_id),
    ('Rent & Leases', 'Expense', org_id),
    ('Travel', 'Expense', org_id),
    ('Meals & Entertainment', 'Expense', org_id),
    ('Hardware', 'Expense', org_id),
    ('Bank Charges & Fees', 'Expense', org_id),
    ('Professional Fees', 'Expense', org_id),
    ('Legal Fees', 'Expense', org_id),
    ('Insurance', 'Expense', org_id),
    ('Repairs & Maintenance', 'Expense', org_id),
    ('Cost of Sales', 'Expense', org_id),
    ('COGS - Raw Materials', 'Expense', org_id),
    ('COGS - Direct Labor', 'Expense', org_id),
    ('Taxes - Corporate', 'Expense', org_id),
    ('Miscellaneous', 'Expense', org_id),
    ('Inter-account Transfer', 'Expense', org_id),
    ('Uncategorized', 'Expense', org_id),
    ('Cash & Bank', 'Asset', org_id),
    ('Accounts Receivable', 'Asset', org_id),
    ('Inventory Asset', 'Asset', org_id),
    ('Fixed Assets', 'Asset', org_id),
    ('Accounts Payable', 'Liability', org_id),
    ('VAT Payable', 'Liability', org_id),
    ('WHT Payable', 'Liability', org_id);
end;
$$ language plpgsql;

-- ============== NRS SUBMISSIONS ==============
create table nrs_submissions (
  id text primary key,
  invoice_id text not null,
  irn text not null,
  csid text,
  qr_code text,
  status text not null default 'pending' check (status in ('pending', 'transmitted', 'confirmed', 'failed')),
  submitted_at timestamptz default now(),
  confirmed_at timestamptz,
  error text,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== CLIENT PORTAL LINKS ==============
create table client_portal_links (
  token text primary key,
  invoice_id text not null,
  invoice_number text not null,
  client_name text not null,
  total_amount numeric(15,2) not null,
  currency text default 'NGN',
  status text not null,
  viewed_at timestamptz,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== AI ALERTS ==============
create table ai_alerts (
  id text primary key,
  type text not null,
  severity text not null check (severity in ('critical', 'warning', 'info')),
  title text not null,
  message text not null,
  dismissed boolean default false,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

create index idx_nrs_submissions_org on nrs_submissions(organization_id);
create index idx_nrs_submissions_irn on nrs_submissions(irn);
create index idx_client_portal_org on client_portal_links(organization_id);
create index idx_ai_alerts_org on ai_alerts(organization_id);

-- ============== CORPORATE CARDS ==============
create table corporate_cards (
  id text primary key default ('card_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  type text not null check (type in ('virtual', 'physical')),
  status text not null default 'active' check (status in ('active', 'frozen', 'cancelled')),
  last4 text not null,
  spend_limit numeric(15,2) not null default 500000,
  spent_amount numeric(15,2) default 0,
  currency text default 'NGN',
  assigned_to text,
  assigned_to_name text,
  category_controls jsonb default '[]',
  is_active boolean default true,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

create table card_transactions (
  id text primary key default ('ctx_' || replace(uuid_generate_v4()::text, '-', '')),
  card_id text not null references corporate_cards(id) on delete cascade,
  amount numeric(15,2) not null,
  currency text default 'NGN',
  merchant text not null,
  category text,
  date timestamptz default now(),
  status text not null default 'completed' check (status in ('pending', 'completed', 'declined')),
  reference text,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== APPROVAL WORKFLOWS ==============
create table approval_policies (
  id text primary key default ('ap_' || replace(uuid_generate_v4()::text, '-', '')),
  name text not null,
  entity_type text not null check (entity_type in ('invoice', 'bill', 'purchase_order', 'journal_entry', 'expense_claim')),
  min_amount numeric(15,2) not null default 0,
  max_amount numeric(15,2),
  levels jsonb not null default '[]',
  is_active boolean default true,
  entity_id text references entities(id) on delete set null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

create table approval_requests (
  id text primary key default ('ar_' || replace(uuid_generate_v4()::text, '-', '')),
  entity_type text not null,
  entity_id text not null,
  requested_by text not null,
  requested_by_name text not null,
  amount numeric(15,2) not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  current_level integer default 1,
  total_levels integer default 1,
  approvals jsonb default '[]',
  resolved_at timestamptz,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

create index idx_corporate_cards_org on corporate_cards(organization_id);
create index idx_card_transactions_card on card_transactions(card_id);
create index idx_approval_requests_org on approval_requests(organization_id);
create index idx_approval_requests_status on approval_requests(status);

-- ============== NOTIFICATIONS ==============
create table notifications (
  id text primary key default ('notif_' || replace(uuid_generate_v4()::text, '-', '')),
  type text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  title text not null,
  message text not null,
  read boolean default false,
  action_url text,
  metadata jsonb,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== USER PERMISSIONS ==============
create table user_permissions (
  user_id text primary key,
  permissions jsonb not null default '[]',
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============== AUDIT LOGS V2 ==============
create table audit_logs_v2 (
  id text primary key default ('alog_' || replace(uuid_generate_v4()::text, '-', '')),
  timestamp timestamptz default now(),
  user_id text not null,
  user_name text not null,
  action text not null check (action in ('create', 'update', 'delete', 'approve', 'reject', 'login', 'export', 'submit')),
  entity_type text not null,
  entity_id text not null,
  entity_name text not null,
  module text not null,
  changes jsonb,
  ip_address text,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

create index idx_notifications_org on notifications(organization_id);
create index idx_notifications_read on notifications(read);
create index idx_audit_logs_v2_org on audit_logs_v2(organization_id);
create index idx_audit_logs_v2_entity on audit_logs_v2(entity_type, entity_id);
create index idx_user_permissions_org on user_permissions(organization_id);
