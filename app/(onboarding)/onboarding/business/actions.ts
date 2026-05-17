"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUSStateCode } from "@/lib/onboarding/us-states";
import { isINStateCode } from "@/lib/onboarding/in-states";

function redirectWithError(message: string): never {
  redirect(`/onboarding/business?error=${encodeURIComponent(message)}`);
}

export async function createBusinessAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const country_code = String(formData.get("country_code") ?? "US").trim().toUpperCase();
  const currency_code = String(formData.get("currency_code") ?? "USD").trim().toUpperCase();

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

  const { error } = await supabase.from("businesses").insert({
    owner_user_id: user.id,
    name,
    state,
    country_code,
    currency_code,
  });

  if (error) {
    redirectWithError(error.message);
  }

  redirect("/onboarding/employees");
}