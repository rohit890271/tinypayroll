"use client";

import { formatCurrency } from "@/lib/payroll/formatCurrency";
import type { EnrichedEmployee, PayrollCalc } from "./types";

type Props = {
  employees: EnrichedEmployee[];
  calcs: Record<string, PayrollCalc | null>;
  cc: string;
  periodStart: string;
  periodEnd: string;
  totalCost: number;
  onClose: () => void;
};

export function PreviewModal({
  employees,
  calcs,
  cc,
  periodStart,
  periodEnd,
  totalCost,
  onClose,
}: Props) {
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
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {employees.map((emp) => {
                const c = calcs[emp.id];
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
