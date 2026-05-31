-- Align the database schema with columns the application actually reads/writes.
-- The live database was hand-edited after the initial migration
-- (202605100001_create_tinypayroll_schema.sql), so it already contains most of
-- these columns. Everything here is additive and idempotent (`if not exists`) so
-- it can be safely applied to the live DB and reproduces the schema from source.
--
-- Note: `businesses.state` keeps its `~ '^[A-Z]{2}$'` check from the base
-- migration. All US and India state codes (lib/onboarding/{us,in}-states.ts) are
-- two uppercase letters, so the check remains valid for both countries.

-- ── businesses ────────────────────────────────────────────────────────────────
alter table public.businesses
  add column if not exists country_code text not null default 'US',
  add column if not exists currency_code text not null default 'USD',
  add column if not exists subscription_status text,
  add column if not exists trial_ends_at date,
  add column if not exists subscription_ends_at date,
  add column if not exists dodo_customer_id text,
  add column if not exists dodo_subscription_id text,
  add column if not exists referral_code text,
  add column if not exists referred_by_business_id uuid references public.businesses(id),
  add column if not exists referral_credits_earned integer not null default 0;

-- subscription_status is a free-text status with a known value set.
alter table public.businesses
  drop constraint if exists businesses_subscription_status_check;
alter table public.businesses
  add constraint businesses_subscription_status_check
  check (
    subscription_status is null
    or subscription_status in ('trialing', 'active', 'cancelled', 'past_due')
  );

-- Referral codes must be unique when present.
create unique index if not exists businesses_referral_code_key
  on public.businesses (referral_code)
  where referral_code is not null;

create index if not exists businesses_referred_by_business_id_idx
  on public.businesses (referred_by_business_id);

-- ── payroll_runs ──────────────────────────────────────────────────────────────
alter table public.payroll_runs
  add column if not exists country_code text not null default 'US',
  add column if not exists currency_code text not null default 'USD';

-- ── payroll_line_items ──────────────────────────────────────────────────────────
-- The base migration created `unpaid_leave_hours`; the app uses days. Add the
-- canonical `unpaid_leave_days` column. The legacy column is intentionally left
-- in place (do not drop pre-existing columns).
alter table public.payroll_line_items
  add column if not exists unpaid_leave_days numeric(8,2) not null default 0,
  add column if not exists employer_cost numeric(12,2) not null default 0;

-- Keep the non-negative invariant for the new monetary columns.
alter table public.payroll_line_items
  drop constraint if exists payroll_line_items_new_cols_non_negative_check;
alter table public.payroll_line_items
  add constraint payroll_line_items_new_cols_non_negative_check
  check (unpaid_leave_days >= 0 and employer_cost >= 0);
