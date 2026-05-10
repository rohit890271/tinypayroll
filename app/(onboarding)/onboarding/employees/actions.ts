"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/data/business";
import { buildEmployeeInsert, type PayType, type TaxFilingStatus } from "@/lib/onboarding/employee-payload";
import { createClient } from "@/lib/supabase/server";

function redirectWithError(message: string): never {
  redirect(`/onboarding/employees?error=${encodeURIComponent(message)}`);
}

function isPayType(value: string): value is PayType {
  return value === "hourly" || value === "salary";
}

function isTaxFilingStatus(value: string): value is TaxFilingStatus {
  return value === "single" || value === "married";
}

export async function addEmployeeAction(formData: FormData) {
  const { user, business } = await getCurrentUserBusiness();

  if (!user) {
    redirect("/login");
  }

  if (!business) {
    redirect("/onboarding/business");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const payType = String(formData.get("payType") ?? "");
  const hourlyRate = formData.get("hourlyRate")?.toString() ?? null;
  const annualSalary = formData.get("annualSalary")?.toString() ?? null;
  const taxFilingStatus = String(formData.get("taxFilingStatus") ?? "");

  if (!name || !email) {
    redirectWithError("Employee name and email are required.");
  }

  if (!isPayType(payType)) {
    redirectWithError("Choose hourly or salary pay.");
  }

  if (!isTaxFilingStatus(taxFilingStatus)) {
    redirectWithError("Choose a valid tax filing status.");
  }

  let payload;
  try {
    payload = buildEmployeeInsert({
      businessId: business.id,
      name,
      email,
      payType,
      hourlyRate,
      annualSalary,
      taxFilingStatus
    });
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Employee pay details are invalid.");
  }

  const supabase = createClient();
  const { error } = await supabase.from("employees").insert(payload);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/onboarding/employees");
  revalidatePath("/dashboard/employees");
  redirect("/onboarding/employees");
}