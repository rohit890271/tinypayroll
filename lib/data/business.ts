import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type Business = {
  id: string;
  owner_user_id?: string;
  name: string;
  state: string;
  country_code: string;
  subscription_status?: string;
  dodo_customer_id?: string;
  dodo_subscription_id?: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  referral_code?: string;
  referred_by_business_id?: string;
  referral_credits_earned?: number;
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
    .select("id, owner_user_id, name, state, country_code, subscription_status, dodo_customer_id, dodo_subscription_id, trial_ends_at, subscription_ends_at, referral_code, referred_by_business_id, referral_credits_earned, created_at")
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

// ── Payroll types ─────────────────────────────────────────────────────────────
export type PayrollRun = {
  id: string;
  business_id: string;
  pay_period_start: string;
  pay_period_end: string;
  run_date: string;
  status: string;
  country_code: string;
  currency_code: string;
  created_at?: string;
};

export type PayrollLineItem = {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  pay_type: "hourly" | "salary";
  hours_worked: number | null;
  overtime_hours: number | null;
  unpaid_leave_days: number;
  bonus_amount: number;
  gross_pay: number;
  // DB columns: persisted by the payroll server action.
  tax_withheld: number;
  net_pay: number;
  employer_cost: number;
  // joined employee name
  employee?: { name: string; email: string };
};

export async function getPayrollRuns(businessId: string): Promise<PayrollRun[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payroll_runs")
    .select("*")
    .eq("business_id", businessId)
    .order("run_date", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return (data ?? []) as PayrollRun[];
}

export async function getPayrollRunDetail(
  runId: string,
  businessId: string
): Promise<{ run: PayrollRun; lineItems: PayrollLineItem[] } | null> {
  const supabase = createClient();

  const { data: run, error: runErr } = await supabase
    .from("payroll_runs")
    .select("*")
    .eq("id", runId)
    .eq("business_id", businessId)
    .single();

  if (runErr || !run) return null;

  const { data: lineItems, error: lineErr } = await supabase
    .from("payroll_line_items")
    .select("*, employee:employees(name, email)")
    .eq("payroll_run_id", runId)
    .order("employee_id");

  if (lineErr) throw new Error(lineErr.message);

  return { run: run as PayrollRun, lineItems: (lineItems ?? []) as PayrollLineItem[] };
}