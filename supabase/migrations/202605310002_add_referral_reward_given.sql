-- Fix #2: dedicated referral-reward flag.
--
-- Previously the code overloaded `businesses.referral_credits_earned` to mean
-- BOTH "months a referrer has earned" AND "this referee already triggered a
-- reward". Those collide once a referred business later refers someone else.
--
-- `referral_reward_given` is the referee-side flag: has this business already
-- generated a reward for the business that referred it? `referral_credits_earned`
-- now exclusively counts rewards a referrer has earned.

alter table public.businesses
  add column if not exists referral_reward_given boolean not null default false;

-- Backfill: businesses that were referred AND already triggered a reward under
-- the old (overloaded) scheme get the flag set so they are not rewarded again.
update public.businesses
  set referral_reward_given = true
  where referred_by_business_id is not null
    and referral_credits_earned > 0
    and referral_reward_given = false;
