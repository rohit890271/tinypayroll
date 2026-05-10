import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ className = "", label, children, ...props }: SelectProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      <span>{label}</span>
      <select
        className={`rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-payroll focus:ring-4 focus:ring-payroll/10 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}