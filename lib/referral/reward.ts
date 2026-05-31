// Server-only: imported solely from the Dodo webhook route. Uses the
// service-role admin client, so it must never be imported into client code.
import { createAdminClient } from "@/lib/supabase/admin";
import { getDodoClient } from "@/lib/dodo";

export type ReferralRewardResult = {
  rewarded: boolean;
  reason?: string;
};

/**
 * Processes a referral reward for a business that just paid.
 *
 * Called IN-PROCESS from the Dodo webhook (payment.succeeded) — never exposed as
 * a public HTTP endpoint, and always run with the service-role admin client.
 *
 * Flow:
 *  1. Find the paying (referee) business by dodo_customer_id.
 *  2. Bail if it has no referrer or has already generated a reward
 *     (referral_reward_given).
 *  3. Atomically CLAIM the reward by flipping referral_reward_given false→true.
 *     If the claim updates 0 rows, another process already handled it — stop.
 *     Claiming before granting prevents double free-months under retries/races.
 *  4. Grant the referrer one free month via Dodo (best-effort).
 *  5. Increment the referrer's referral_credits_earned counter.
 */
export async function processReferralReward(
  dodoCustomerId: string
): Promise<ReferralRewardResult> {
  const supabase = createAdminClient();

  // 1. Paying (referee) business
  const { data: referee, error: refereeErr } = await supabase
    .from("businesses")
    .select("id, referred_by_business_id, referral_reward_given")
    .eq("dodo_customer_id", dodoCustomerId)
    .maybeSingle();

  if (refereeErr || !referee) {
    return { rewarded: false, reason: "Business not found" };
  }
  if (!referee.referred_by_business_id) {
    return { rewarded: false, reason: "No referrer" };
  }
  if (referee.referral_reward_given) {
    return { rewarded: false, reason: "Reward already given" };
  }

  // 3. Atomic claim: only the caller that flips false→true proceeds.
  const { data: claimed, error: claimErr } = await supabase
    .from("businesses")
    .update({ referral_reward_given: true })
    .eq("id", referee.id)
    .eq("referral_reward_given", false)
    .select("id");

  if (claimErr) {
    return { rewarded: false, reason: claimErr.message };
  }
  if (!claimed || claimed.length === 0) {
    return { rewarded: false, reason: "Reward already given" };
  }

  // 2b. Load the referrer (after claiming).
  const { data: referrer, error: referrerErr } = await supabase
    .from("businesses")
    .select("id, dodo_subscription_id, referral_credits_earned")
    .eq("id", referee.referred_by_business_id)
    .maybeSingle();

  if (referrerErr || !referrer) {
    return { rewarded: false, reason: "Referrer not found" };
  }

  // 4. Grant one free month (best-effort — a failure here is logged, not retried;
  //    the claim above guarantees we never double-grant).
  if (referrer.dodo_subscription_id) {
    try {
      const dodo = getDodoClient();
      const sub = await dodo.subscriptions.retrieve(referrer.dodo_subscription_id);
      const newDate = new Date(sub.next_billing_date);
      newDate.setMonth(newDate.getMonth() + 1);
      await dodo.subscriptions.update(referrer.dodo_subscription_id, {
        next_billing_date: newDate.toISOString().split("T")[0],
      });
    } catch (err: any) {
      console.error("Dodo subscription extension failed:", err?.message ?? err);
      // Continue: still record the credit so it is visible/recoverable.
    }
  }

  // 5. Increment the referrer's earned-months counter.
  await supabase
    .from("businesses")
    .update({ referral_credits_earned: (referrer.referral_credits_earned ?? 0) + 1 })
    .eq("id", referrer.id);

  return { rewarded: true };
}
