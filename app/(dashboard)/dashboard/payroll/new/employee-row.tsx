"use client";

import { formatCurrency } from "@/lib/payroll/formatCurrency";
import type { EnrichedEmployee, RowInputs, PayrollCalc } from "./types";
import { DeductionsTooltip } from "./deductions-tooltip";

type Props = {
  emp: EnrichedEmployee;
  cc: string;
  inputs: RowInputs;
  calc: PayrollCalc | null;
  onInput: (empId: string, field: keyof RowInputs, value: string) => void;
  tooltipEmpId: string | null;
  setTooltipEmpId: (id: string | null) => void;
};

const numInput =
  "w-24 rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-right text-sm text-ink tabular-nums outline-none transition focus:border-payroll focus:ring-2 focus:ring-payroll/10 disabled:bg-cream/50 disabled:text-moss/50";

export function EmployeeRow({
  emp,
  cc,
  inputs,
  calc,
  onInput,
  tooltipEmpId,
  setTooltipEmpId,
}: Props) {
  const isHourly = emp.pay_type === "hourly";
  const initials = emp.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <tr className="group transition hover:bg-oat/30">
      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-payroll/10 text-xs font-bold text-payroll">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-ink leading-tight">{emp.name}</p>
            <p className="text-xs text-moss capitalize">{emp.pay_type}</p>
          </div>
        </div>
      </td>

      {/* Hours Worked */}
      <td className="px-4 py-3 text-right">
        <input
          id={`hours-${emp.id}`}
          type="number"
          min="0"
          step="0.5"
          value={inputs.hoursWorked}
          onChange={(e) => onInput(emp.id, "hoursWorked", e.target.value)}
          disabled={!isHourly}
          className={numInput}
          aria-label={`Hours worked for ${emp.name}`}
        />
      </td>

      {/* Overtime Hours */}
      <td className="px-4 py-3 text-right">
        <input
          id={`ot-${emp.id}`}
          type="number"
          min="0"
          step="0.5"
          value={inputs.overtimeHours}
          onChange={(e) => onInput(emp.id, "overtimeHours", e.target.value)}
          disabled={!isHourly}
          className={numInput}
          aria-label={`Overtime hours for ${emp.name}`}
        />
      </td>

      {/* Unpaid Leave Days */}
      <td className="px-4 py-3 text-right">
        <input
          id={`leave-${emp.id}`}
          type="number"
          min="0"
          step="1"
          value={inputs.unpaidLeaveDays}
          onChange={(e) => onInput(emp.id, "unpaidLeaveDays", e.target.value)}
          className={numInput}
          aria-label={`Unpaid leave days for ${emp.name}`}
        />
      </td>

      {/* Bonus Amount */}
      <td className="px-4 py-3 text-right">
        <input
          id={`bonus-${emp.id}`}
          type="number"
          min="0"
          step="100"
          value={inputs.bonusAmount}
          onChange={(e) => onInput(emp.id, "bonusAmount", e.target.value)}
          className={numInput}
          aria-label={`Bonus for ${emp.name}`}
        />
      </td>

      {/* Gross Pay */}
      <td className="px-4 py-3 text-right">
        <span className="font-semibold tabular-nums text-ink">
          {calc ? formatCurrency(calc.gross_pay, cc) : "—"}
        </span>
      </td>

      {/* Net Pay + Tooltip */}
      <td className="relative px-4 py-3 text-right">
        <button
          type="button"
          id={`net-pay-btn-${emp.id}`}
          className="font-bold tabular-nums text-payroll underline decoration-dotted underline-offset-2 hover:text-payroll/80 transition cursor-help"
          onMouseEnter={() => setTooltipEmpId(emp.id)}
          onMouseLeave={() => setTooltipEmpId(null)}
          onClick={() =>
            setTooltipEmpId(tooltipEmpId === emp.id ? null : emp.id)
          }
          aria-label={`Net pay breakdown for ${emp.name}`}
        >
          {calc ? formatCurrency(calc.net_pay, cc) : "—"}
        </button>
        {tooltipEmpId === emp.id && calc && (
          <DeductionsTooltip calc={calc} cc={cc} />
        )}
      </td>
    </tr>
  );
}
