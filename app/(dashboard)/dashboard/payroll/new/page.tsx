import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewPayrollClient } from "./new-payroll-client";
import type { Employee } from "@/lib/data/business";
import type { BusinessWithCountry } from "./types";

export default async function NewPayrollPage() {
  const supabase = createClient();

  // 1. Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch business with country / currency columns
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id, name, state, country_code, currency_code")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (bizError) throw new Error(bizError.message);
  if (!business) redirect("/onboarding/business");

  // 3. Fetch employees – include country_code inherited from business
  const { data: employees, error: empError } = await supabase
    .from("employees")
    .select(
      "id, business_id, name, email, pay_type, hourly_rate, annual_salary, tax_filing_status, created_at"
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  if (empError) throw new Error(empError.message);

  // Attach country_code to each employee (engine needs it)
  const enrichedEmployees: (Employee & { country_code: string })[] = (
    employees ?? []
  ).map((emp) => ({ ...emp, country_code: business.country_code }));

  return (
    <NewPayrollClient
      business={business as BusinessWithCountry}
      employees={enrichedEmployees}
    />
  );
}
