"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/payroll/formatCurrency";
import type { EnrichedEmployee, PayrollCalc } from "./types";
import type { BusinessWithCountry } from "./types";
import type { PayslipData } from "@/lib/payroll/generatePayslip";

type Props = {
  employees: EnrichedEmployee[];
  calcs: Record<string, PayrollCalc | null>;
  cc: string;
  business: BusinessWithCountry;
  periodStart: string;
  periodEnd: string;
  totalCost: number;
  onClose: () => void;
};

export function PreviewModal({
  employees,
  calcs,
  cc,
  business,
  periodStart,
  periodEnd,
  totalCost,
  onClose,
}: Props) {
  const [downloading, setDownloading] = useState<string | null>(null); // empId or "all"

  const totalGross = employees.reduce(
    (s, e) => s + (calcs[e.id]?.gross_pay ?? 0),
    0
  );
  const totalDeductions = employees.reduce(
    (s, e) => s + (calcs[e.id]?.total_deductions ?? 0),
    0
  );
  const totalNet = employees.reduce(
    (s, e) => s + (calcs[e.id]?.net_pay ?? 0),
    0
  );

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // Build PayslipData for one employee
  function buildPayslipData(emp: EnrichedEmployee): PayslipData | null {
    const calc = calcs[emp.id];
    if (!calc) return null;
    return {
      business,
      employee: emp,
      calc: calc as PayslipData["calc"],
      periodStart,
      periodEnd,
    };
  }

  async function handleDownloadSingle(emp: EnrichedEmployee) {
    const data = buildPayslipData(emp);
    if (!data) return;
    setDownloading(emp.id);
    try {
      const { downloadPayslip } = await import("@/lib/payroll/generatePayslip");
      await downloadPayslip(data);
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadAll() {
    setDownloading("all");
    try {
      const { downloadAllPayslipsAsZip } = await import("@/lib/payroll/generatePayslip");
      const payslips = employees
        .map(buildPayslipData)
        .filter(Boolean) as PayslipData[];
      await downloadAllPayslipsAsZip(payslips, business.name, periodStart, cc);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-ink/10 bg-white shadow-soft">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <h2 id="preview-modal-title" className="text-lg font-bold text-ink">
              Payroll Preview
            </h2>
            <p className="mt-0.5 text-sm text-moss">
              {fmtDate(periodStart)} – {fmtDate(periodEnd)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Download All ZIP */}
            <button
              id="btn-download-all"
              onClick={handleDownloadAll}
              disabled={downloading !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-payroll/30 bg-payroll/5 px-4 py-2 text-xs font-semibold text-payroll hover:bg-payroll/10 transition disabled:opacity-40"
            >
              {downloading === "all" ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              )}
              {downloading === "all" ? "Zipping…" : "Download All (.zip)"}
            </button>
            <button
              id="btn-close-preview"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-full p-2 text-moss hover:bg-cream transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-2 pb-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-cream/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-moss">
                  Employee
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">
                  Gross Pay
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">
                  Deductions
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">
                  Net Pay
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">
                  Payslip
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {employees.map((emp) => {
                const c = calcs[emp.id];
                const isDownloading = downloading === emp.id;
                return (
                  <tr key={emp.id} className="hover:bg-oat/20 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{emp.name}</p>
                      <p className="text-xs text-moss capitalize">{emp.pay_type}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">
                      {c ? formatCurrency(c.gross_pay, cc) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-500">
                      {c ? `-${formatCurrency(c.total_deductions, cc)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-payroll">
                      {c ? formatCurrency(c.net_pay, cc) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        id={`btn-download-payslip-${emp.id}`}
                        onClick={() => handleDownloadSingle(emp)}
                        disabled={downloading !== null || !c}
                        className="inline-flex items-center gap-1 rounded-full bg-payroll px-3 py-1.5 text-xs font-semibold text-white hover:bg-payroll/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isDownloading ? (
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        )}
                        {isDownloading ? "…" : "PDF"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Grand Totals */}
            <tfoot>
              <tr className="border-t-2 border-ink/20 bg-cream/40 font-bold">
                <td className="px-4 py-3 text-ink">Grand Total</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink">
                  {formatCurrency(totalGross, cc)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-red-600">
                  -{formatCurrency(totalDeductions, cc)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-payroll">
                  {formatCurrency(totalNet, cc)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-ink/10 px-6 py-4">
          <div>
            <p className="text-xs text-moss">Total employer cost (incl. contributions)</p>
            <p className="text-xl font-black tabular-nums text-ink">
              {formatCurrency(totalCost, cc)}
            </p>
          </div>
          <button
            id="btn-close-preview-footer"
            onClick={onClose}
            className="rounded-full border border-ink/20 bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
