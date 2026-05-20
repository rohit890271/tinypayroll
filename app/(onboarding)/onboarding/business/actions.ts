"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUSStateCode } from "@/lib/onboarding/us-states";
import { isINStateCode } from "@/lib/onboarding/in-states";
import { generateReferralCode } from "@/lib/referral/generate-code";

function redirectWithError(message: string): never {
  redirect(`/onboarding/business?error=${encodeURIComponent(message)}`);
}

async function generateUniqueCode(
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode();
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  // Fallback: timestamp-based code (always unique)
  return "TINY" + Date.now().toString(36).slice(-4).toUpperCase();
}

export async function createBusinessAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const country_code = String(formData.get("country_code") ?? "US").trim().toUpperCase();
  const currency_code = String(formData.get("currency_code") ?? "USD").trim().toUpperCase();
  const referralCodeInput = String(formData.get("referral_code") ?? "").trim().toUpperCase();

  if (!name) {
    redirectWithError("Business name is required.");
  }

  // Validate state against the correct country list
  const stateValid =
    country_code === "IN" ? isINStateCode(state) : isUSStateCode(state);

  if (!stateValid) {
    redirectWithError(
      country_code === "IN"
        ? "Choose a valid Indian state or UT."
        : "Choose a valid US state."
    );
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Generate a unique referral code for this new business
  const referralCode = await generateUniqueCode(supabase);

  // Look up the referrer if a code was provided
  let referredByBusinessId: string | null = null;
  if (referralCodeInput) {
    const { data: referrer } = await supabase
      .from("businesses")
      .select("id")
      .eq("referral_code", referralCodeInput)
      .maybeSingle();
    if (referrer) {
      referredByBusinessId = referrer.id;
    }
  }

  const insertPayload: Record<string, unknown> = {
    owner_user_id: user.id,
    name,
    state,
    country_code,
    currency_code,
    referral_code: referralCode,
  };

  if (referredByBusinessId) {
    insertPayload.referred_by_business_id = referredByBusinessId;
  }

  const { error } = await supabase.from("businesses").insert(insertPayload);

  if (error) {
    redirectWithError(error.message);
  }

  redirect("/onboarding/employees");
}