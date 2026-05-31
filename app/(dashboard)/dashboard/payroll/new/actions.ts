"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserBusiness, getEmployeesForBusiness } from "@/lib/data/business";
import { calculateEmployeePayroll } from "@/lib/payroll/calculatePayroll";

export type PayrollRowInput = {
  employeeId: string;
  hoursWorked: number;
  overtimeHours: number;
  unpaidLeaveDays: number;
  bonusAmount: number;
};

export type ProcessPayrollInput = {
  businessId: string;
  periodStart: string;
  periodEnd: string;
  rows: PayrollRowInput[];
};

export type ProcessPayrollResult =
  | { runId: string; error?: never }
  | { runId?: never; error: string };

/**
 * Processes a payroll run server-side.
 *
 * All monetary figures (gross, deductions, net, employer cost) are recomputed
 * here from the authoritative employee records and the raw, non-monetary inputs
 * sent by the client. Client-supplied money values are never trusted or persisted.
 * RLS (user-scoped Supabase client) still enforces tenant isolation.
 */
export async function processPayrollRun(
  input: ProcessPayrollInput
): Promise<ProcessPayrollResult> {
  const { business } = await getCurrentUserBusiness();

  if (!business) {
    return { error: "No business found for the current user." };
  }
  if (business.id !== input.businessId) {
    return { error: "You do not have access to this business." };
  }

  const employees = await getEmployeesForBusiness(business.id);
  const employeesById = new Map(employees.map((e) => [e.id, e]));
  const countryCode = business.country_code ?? "US";
  const currencyCode = (business as { currency_code?: string }).currency_code ?? "USD";
  const currentMonth = new Date().getMonth() + 1;

  // Build line items from server-recomputed figures. Unknown / foreign employee
  // ids are ignored so a tampered client cannot inject rows for other businesses.
  const computedRows = input.rows
    .map((row) => {
      const employee = employeesById.get(row.employeeId);
      if (!employee) return null;

      const isHourly = employee.pay_type === "hourly";
      const calc = calculateEmployeePayroll(
        { ...employee, country_code: countryCode },
        isHourly ? Math.max(0, row.hoursWorked) || 0 : 0,
        isHourly ? Math.max(0, row.overtimeHours) || 0 : 0,
        Math.max(0, row.unpaidLeaveDays) || 0,
        Math.max(0, row.bonusAmount) || 0,
        { currentMonth }
      );

      return {
        employee_id: employee.id,
        hours_worked: isHourly ? Math.max(0, row.hoursWorked) || 0 : 0,
        overtime_hours: isHourly ? Math.max(0, row.overtimeHours) || 0 : 0,
        unpaid_leave_days: Math.max(0, row.unpaidLeaveDays) || 0,
        bonus_amount: Math.max(0, row.bonusAmount) || 0,
        gross_pay: calc.gross_pay,
        tax_withheld: calc.total_deductions,
        net_pay: calc.net_pay,
        employer_cost: calc.employer_total_cost,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (computedRows.length === 0) {
    return { error: "No valid employees to process." };
  }

  const supabase = createClient();

  const { data: run, error: runErr } = await supabase
    .from("payroll_runs")
    .insert({
      business_id: business.id,
      pay_period_start: input.periodStart,
      pay_period_end: input.periodEnd,
      run_date: new Date().toISOString().split("T")[0],
      status: "processed",
      country_code: countryCode,
      currency_code: currencyCode,
    })
    .select("id")
    .single();

  if (runErr || !run) {
    return { error: runErr?.message ?? "Failed to create payroll run." };
  }

  const lineItems = computedRows.map((r) => ({ ...r, payroll_run_id: run.id }));

  const { error: lineErr } = await supabase
    .from("payroll_line_items")
    .insert(lineItems);

  if (lineErr) {
    return { error: lineErr.message };
  }

  return { runId: run.id };
}
