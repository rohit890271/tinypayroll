"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUSStateCode } from "@/lib/onboarding/us-states";

function redirectWithError(message: string): never {
  redirect(`/onboarding/business?error=${encodeURIComponent(message)}`);
}

export async function createBusinessAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();

  if (!name) {
    redirectWithError("Business name is required.");
  }

  if (!isUSStateCode(state)) {
    redirectWithError("Choose a valid US state.");
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
    state
  });

  if (error) {
    redirectWithError(error.message);
  }

  redirect("/onboarding/employees");
}