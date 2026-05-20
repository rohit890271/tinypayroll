import { createClient } from "@/lib/supabase/server";

export type ReferralStats = {
  totalReferred: number;
  monthsEarned: number;
};

export async function getReferralStats(businessId: string): Promise<ReferralStats> {
  const supabase = createClient();

  const { count } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("referred_by_business_id", businessId);

  // Get the referrer's own referral_credits_earned
  const { data: biz } = await supabase
    .from("businesses")
    .select("referral_credits_earned")
    .eq("id", businessId)
    .maybeSingle();

  return {
    totalReferred: count ?? 0,
    monthsEarned: biz?.referral_credits_earned ?? 0,
  };
}
