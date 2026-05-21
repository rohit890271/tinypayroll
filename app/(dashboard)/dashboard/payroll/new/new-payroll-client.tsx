"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateEmployeePayroll } from "@/lib/payroll/calculatePayroll";
import { formatCurrency } from "@/lib/payroll/formatCurrency";
import type { BusinessWithCountry, PayrollCalc, RowInputs, EnrichedEmployee } from "./types";
import { EmployeeRow } from "./employee-row";
import { PreviewModal } from "./preview-modal";

// Types are defined in ./types.ts — re-export for any legacy imports
export type { PayrollCalc, RowInputs, EnrichedEmployee } from "./types";

import { useToast } from "@/components/ui/toast";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCurrentPeriod(countryCode: string): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  if (countryCode === "IN") {
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    return { start: fmt(start), end: fmt(end) };
  }

  // US bi-weekly: anchor to Jan 1 epoch, find current window
  const epoch = new Date(2023, 0, 1); // known bi-weekly start
  const daysSince = Math.floor((now.getTime() - epoch.getTime()) / 86400000);
  const periodStart = new Date(epoch);
  periodStart.setDate(epoch.getDate() + Math.floor(daysSince / 14) * 14);
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodStart.getDate() + 13);
  return { start: fmt(periodStart), end: fmt(periodEnd) };
}

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

function safeCalc(
  emp: EnrichedEmployee,
  inputs: RowInputs
): PayrollCalc | null {
  try {
    return calculateEmployeePayroll(
      emp,
      emp.pay_type === "hourly" ? Number(inputs.hoursWorked) || 0 : 0,
      emp.pay_type === "hourly" ? Number(inputs.overtimeHours) || 0 : 0,
      Number(inputs.unpaidLeaveDays) || 0,
      Number(inputs.bonusAmount) || 0,
      { currentMonth: new Date().getMonth() + 1 }
    ) as PayrollCalc;
  } catch {
    return null;
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export function NewPayrollClient({
  business,
  employees,
}: {
  business: BusinessWithCountry;
  employees: EnrichedEmployee[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const cc = business.country_code ?? "US";
  const payCycleLabel = cc === "IN" ? "Monthly Pay Period" : "Bi-Weekly Pay Period";
  const defaultPeriod = getCurrentPeriod(cc);

  const [periodStart, setPeriodStart] = useState(defaultPeriod.start);
  const [periodEnd, setPeriodEnd] = useState(defaultPeriod.end);

  // Per-employee inputs keyed by employee id
  const [rowInputs, setRowInputs] = useState<Record<string, RowInputs>>(() =>
    Object.fromEntries(
      employees.map((e) => [
        e.id,
        { hoursWorked: "0", overtimeHours: "0", unpaidLeaveDays: "0", bonusAmount: "0" },
      ])
    )
  );

  const [showPreview, setShowPreview] = useState(false);
  const [previewSeen, setPreviewSeen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [tooltipEmpId, setTooltipEmpId] = useState<string | null>(null);
  const { success, error } = useToast();

  // Live calcs
  const calcs: Record<string, PayrollCalc | null> = Object.fromEntries(
    employees.map((emp) => [emp.id, safeCalc(emp, rowInputs[emp.id])])
  );

  const totalCost = employees.reduce((sum, emp) => {
    const c = calcs[emp.id];
    return sum + (c?.employer_total_cost ?? 0);
  }, 0);

  const handleInput = useCallback(
    (empId: string, field: keyof RowInputs, value: string) => {
      setRowInputs((prev) => ({
        ...prev,
        [empId]: { ...prev[empId], [field]: value },
      }));
    },
    []
  );

  async function handleConfirm() {
    setProcessing(true);
    const supabase = createClient();

    try {
      // Insert payroll_run
      const { data: run, error: runErr } = await supabase
        .from("payroll_runs")
        .insert({
          business_id: business.id,
          pay_period_start: periodStart,
          pay_period_end: periodEnd,
          run_date: new Date().toISOString().split("T")[0],
          status: "processed",
          country_code: cc,
          currency_code: business.currency_code,
        })
        .select("id")
        .single();

      if (runErr) throw runErr;

      // Build line items — columns match live DB schema exactly
      const lineItems = employees.map((emp) => {
        const c = calcs[emp.id];
        const inputs = rowInputs[emp.id];
        return {
          payroll_run_id: run.id,
          employee_id: emp.id,
          hours_worked: emp.pay_type === "hourly" ? Number(inputs.hoursWorked) || 0 : 0,
          overtime_hours: emp.pay_type === "hourly" ? Number(inputs.overtimeHours) || 0 : 0,
          unpaid_leave_days: Number(inputs.unpaidLeaveDays) || 0,
          bonus_amount: Number(inputs.bonusAmount) || 0,
          gross_pay: c?.gross_pay ?? 0,
          tax_withheld: c?.total_deductions ?? 0,
          net_pay: c?.net_pay ?? 0,
          employer_cost: c?.employer_total_cost ?? 0,
        };
      });

      const { error: lineErr } = await supabase
        .from("payroll_line_items")
        .insert(lineItems);

      if (lineErr) throw lineErr;

      success("Payroll processed successfully!");
      startTransition(() => router.push("/dashboard"));
    } catch (err: any) {
      console.error("Payroll process error:", err);
      const msg = err?.message || err?.toString() || "Save failed. Please try again.";
      error(msg);
    } finally {
      setProcessing(false);
    }
  }

  const noEmployees = employees.length === 0;

  return (
    <section className="flex flex-col gap-0 min-h-full">
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-payroll mb-2">Payroll</p>
        <h1 className="text-3xl font-black text-ink">New Payroll Run</h1>
        <p className="mt-1 text-sm text-moss">{business.name} · {payCycleLabel}</p>
      </div>

      {/* ── Pay Period Selector ── */}
      <div className="mb-6 flex flex-wrap gap-4 rounded-2xl border border-ink/10 bg-white/70 p-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="period-start" className="text-xs font-semibold uppercase tracking-wider text-moss">
            Start Date
          </label>
          <input
            id="period-start"
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-payroll focus:ring-2 focus:ring-payroll/10"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="period-end" className="text-xs font-semibold uppercase tracking-wider text-moss">
            End Date
          </label>
          <input
            id="period-end"
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-payroll focus:ring-2 focus:ring-payroll/10"
          />
        </div>
        <div className="flex items-end">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-payroll/10 px-3 py-2 text-xs font-semibold text-payroll">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            {payCycleLabel}
          </span>
        </div>
      </div>

      {/* ── Empty State ── */}
      {noEmployees ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-ink/10 py-20 text-center">
          <div className="rounded-full bg-oat p-4">
            <svg className="w-8 h-8 text-moss" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-ink">No employees yet</p>
            <p className="mt-1 text-sm text-moss">Add employees before running payroll.</p>
          </div>
          <a
            href="/dashboard/employees"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-payroll px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-payroll/90 transition"
          >
            Add Employees
          </a>
        </div>
      ) : (
        <>
          {/* ── Employee Table ── */}
          <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-cream/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-moss">Employee</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">Hours</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">OT Hours</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">Leave Days</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">Bonus</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">Gross Pay</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">
                    Net Pay
                    <span className="ml-1 text-[10px] text-moss/50">(hover ▸ breakdown)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {employees.map((emp) => (
                  <EmployeeRow
                    key={emp.id}
                    emp={emp}
                    cc={cc}
                    inputs={rowInputs[emp.id]}
                    calc={calcs[emp.id]}
                    onInput={handleInput}
                    tooltipEmpId={tooltipEmpId}
                    setTooltipEmpId={setTooltipEmpId}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Bottom Bar ── */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white/80 px-6 py-4 shadow-soft">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-moss">Total Payroll Cost</p>
              <p className="mt-0.5 text-2xl font-black text-ink tabular-nums">
                {formatCurrency(totalCost, cc)}
              </p>
              <p className="text-xs text-moss/70">Includes employer contributions</p>
            </div>
            <div className="flex gap-3">
              <button
                id="btn-preview-payroll"
                onClick={() => { setShowPreview(true); setPreviewSeen(true); }}
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-cream transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" /></svg>
                Preview Payroll
              </button>
              <button
                id="btn-confirm-process"
                disabled={!previewSeen || processing}
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-full bg-payroll px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-payroll/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processing ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {processing ? "Processing…" : "Confirm & Process"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Preview Modal ── */}
      {showPreview && (
        <PreviewModal
          employees={employees}
          calcs={calcs}
          cc={cc}
          business={business}
          periodStart={periodStart}
          periodEnd={periodEnd}
          totalCost={totalCost}
          onClose={() => setShowPreview(false)}
        />
      )}
    </section>
  );
}
