import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type Business = {
  id: string;
  owner_user_id?: string;
  name: string;
  state: string;
  created_at?: string;
};

export type Employee = {
  id: string;
  business_id: string;
  name: string;
  email: string;
  pay_type: "hourly" | "salary";
  hourly_rate: number | null;
  annual_salary: number | null;
  tax_filing_status: "single" | "married";
  created_at?: string;
};

export async function getCurrentUserBusiness(): Promise<{ user: User | null; business: Business | null }> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, business: null };
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id, owner_user_id, name, state, created_at")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return { user, business: data as Business | null };
}

export async function getEmployeesForBusiness(businessId: string): Promise<Employee[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id, business_id, name, email, pay_type, hourly_rate, annual_salary, tax_filing_status, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Employee[];
}