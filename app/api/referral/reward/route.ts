import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDodoClient } from "@/lib/dodo";

/**
 * POST /api/referral/reward
 * Called internally from the Dodo webhook on payment.succeeded.
 * Checks if the paying business was referred, and if the referrer has
 * not yet been rewarded for this referral (referral_credits_earned = 0).
 * Awards 1 month free credit via Dodo discount API, then increments the counter.
 *
 * Body: { dodo_customer_id: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dodo_customer_id } = body as { dodo_customer_id?: string };

    if (!dodo_customer_id) {
      return NextResponse.json({ error: "Missing dodo_customer_id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get the paying business
    const { data: payingBusiness, error: payingErr } = await supabase
      .from("businesses")
      .select("id, referred_by_business_id")
      .eq("dodo_customer_id", dodo_customer_id)
      .maybeSingle();

    if (payingErr || !payingBusiness) {
      return NextResponse.json({ rewarded: false, reason: "Business not found" });
    }

    if (!payingBusiness.referred_by_business_id) {
      return NextResponse.json({ rewarded: false, reason: "No referrer" });
    }

    const referrerId = payingBusiness.referred_by_business_id;

    // Get referrer business — check credits not already given for this
    const { data: referrer, error: referrerErr } = await supabase
      .from("businesses")
      .select("id, dodo_subscription_id, referral_credits_earned")
      .eq("id", referrerId)
      .maybeSingle();

    if (referrerErr || !referrer) {
      return NextResponse.json({ rewarded: false, reason: "Referrer not found" });
    }

    // Only reward once per referral (check referral_credits_earned for this specific referring business)
    // We use referral_credits_earned as a simple total counter. 
    // Since one referral code maps to one referrer, we reward every first payment from a new referee.
    // But to avoid double-rewarding, we track whether THIS paying business has already triggered a reward.
    const { data: existingReward } = await supabase
      .from("businesses")
      .select("referral_credits_earned")
      .eq("referred_by_business_id", payingBusiness.id)
      .maybeSingle();

    // Check if reward has already been given for this specific referred business
    const { data: referredBiz } = await supabase
      .from("businesses")
      .select("referral_credits_earned")
      .eq("id", payingBusiness.id)
      .maybeSingle();

    // Use a separate referral_reward_given flag via a simple check:
    // If the paying business itself has referral_credits_earned > 0, it means it was used as a referee already
    // We'll repurpose a boolean approach: track "reward_given" in the paying biz record
    // For simplicity, referral_credits_earned on the paying business = 0 means reward not yet given
    const rewardAlreadyGiven = (referredBiz?.referral_credits_earned ?? 0) > 0;
    if (rewardAlreadyGiven) {
      return NextResponse.json({ rewarded: false, reason: "Reward already given" });
    }

    // Apply a free month by extending the next_billing_date by 1 month
    if (referrer.dodo_subscription_id) {
      try {
        const dodo = getDodoClient();

        // Get current subscription to read next_billing_date
        const sub = await dodo.subscriptions.retrieve(referrer.dodo_subscription_id);
        const currentNextBillingDate = sub.next_billing_date;

        // Advance next_billing_date by 1 month (free month reward)
        const newDate = new Date(currentNextBillingDate);
        newDate.setMonth(newDate.getMonth() + 1);
        const newNextBillingDate = newDate.toISOString().split("T")[0]; // YYYY-MM-DD

        await dodo.subscriptions.update(referrer.dodo_subscription_id, {
          next_billing_date: newNextBillingDate,
        });
      } catch (err: any) {
        console.error("Dodo subscription extension failed:", err.message);
        // Continue anyway to track the reward in DB
      }
    }

    // Increment referral_credits_earned on referrer
    await supabase
      .from("businesses")
      .update({ referral_credits_earned: (referrer.referral_credits_earned ?? 0) + 1 })
      .eq("id", referrerId);

    // Mark the paying business as "reward given" to prevent double-reward
    await supabase
      .from("businesses")
      .update({ referral_credits_earned: 1 })
      .eq("id", payingBusiness.id);

    return NextResponse.json({ rewarded: true });
  } catch (error: any) {
    console.error("Referral reward error:", error);
    return NextResponse.json({ rewarded: false, error: error.message });
  }
}
