-- Fix #3: webhook idempotency.
--
-- Dodo can resend/replay webhooks. Without dedup, a replayed event re-applies
-- subscription-status changes and can re-trigger referral rewards. We record
-- each processed `webhook-id` and short-circuit on replays.
--
-- Only the service-role admin client (the webhook route) touches this table, so
-- RLS is enabled with NO policies (deny-all to anon/authenticated).

create table if not exists public.processed_webhooks (
  webhook_id   text primary key,
  event_type   text,
  processed_at timestamptz not null default now()
);

alter table public.processed_webhooks enable row level security;
