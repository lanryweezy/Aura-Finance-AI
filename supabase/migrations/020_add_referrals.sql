-- ============================================================
-- Aura Finance AI — Referral System Schema
-- ============================================================

-- ============== REFERRAL PROFILES ==============
create table referral_profiles (
  id text primary key default ('rp_' || replace(uuid_generate_v4()::text, '-', '')),
  user_id text not null references users(id) on delete cascade,
  organization_id text not null references organizations(id) on delete cascade,
  referral_code text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);
create index idx_referral_profiles_code on referral_profiles(referral_code);

-- ============== REFERRALS ==============
create table referrals (
  id text primary key default ('ref_' || replace(uuid_generate_v4()::text, '-', '')),
  referrer_user_id text not null references users(id) on delete cascade,
  referred_user_id text not null references users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'pending' check (status in ('pending', 'qualified', 'rewarded', 'rejected')),
  qualification_event text,
  qualified_at timestamptz,
  rewarded_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(referred_user_id), -- Prevent multiple inviters for same account
  constraint prevent_self_referral check (referrer_user_id != referred_user_id)
);
create index idx_referrals_referrer on referrals(referrer_user_id);
create index idx_referrals_referred on referrals(referred_user_id);

-- ============== AI CREDIT LEDGER ==============
-- Extend the existing usage tracking by creating a ledger for bonus credits
create table ai_credit_ledger (
  id text primary key default ('crd_' || replace(uuid_generate_v4()::text, '-', '')),
  organization_id text not null references organizations(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('referral_reward', 'invitee_bonus', 'admin_adjustment')),
  referral_id text references referrals(id) on delete set null,
  recipient_user_id text references users(id) on delete set null,
  credits_awarded integer not null check (credits_awarded > 0),
  idempotency_key text unique not null,
  created_at timestamptz default now()
);
create index idx_ai_credit_ledger_org on ai_credit_ledger(organization_id);

-- Update usage_tracking to allow tracking "bonus_ai_chat" etc if needed, or we just dynamically calculate total limit in service
