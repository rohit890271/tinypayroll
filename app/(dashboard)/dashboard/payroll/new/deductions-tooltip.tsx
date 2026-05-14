"use client";

import { formatCurrency } from "@/lib/payroll/formatCurrency";
import type { PayrollCalc } from "./types";

type Props = {
  calc: PayrollCalc;
  cc: string;
};

export function DeductionsTooltip({ calc, cc }: Props) {
  const isIN = cc === "IN";

  const rows = isIN
    ? [
        { label: "TDS", value: calc.tds ?? 0 },
        { label: "Provident Fund", value: calc.employee_pf ?? 0 },
        { label: "ESI", value: calc.employee_esi ?? 0 },
        { label: "Professional Tax", value: calc.professional_tax ?? 0 },
      ]
    : [
        { label: "Federal Tax", value: calc.federal_tax ?? 0 },
        { label: "Social Security", value: calc.social_security ?? 0 },
        { label: "Medicare", value: calc.medicare ?? 0 },
      ];

  return (
    <div
      role="tooltip"
      className="absolute right-0 top-full z-30 mt-2 min-w-[220px] rounded-xl border border-ink/10 bg-white p-4 shadow-soft"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-moss">
        Deductions Breakdown
      </p>
      <ul className="space-y-1.5">
        {rows.map(({ label, value }) => (
          <li key={label} className="flex justify-between gap-6 text-sm">
            <span className="text-moss">{label}</span>
            <span className="tabular-nums font-medium text-ink">
              {formatCurrency(value, cc)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-ink/10 pt-2.5 text-sm font-semibold">
        <span className="text-ink">Total Deductions</span>
        <span className="tabular-nums text-red-600">
          -{formatCurrency(calc.total_deductions, cc)}
        </span>
      </div>
      <div className="mt-1.5 flex justify-between text-sm font-bold">
        <span className="text-payroll">Net Pay</span>
        <span className="tabular-nums text-payroll">
          {formatCurrency(calc.net_pay, cc)}
        </span>
      </div>
    </div>
  );
}
