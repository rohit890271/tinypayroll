import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ className = "", label, ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      <span>{label}</span>
      <input
        className={`rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-moss/60 focus:border-payroll focus:ring-4 focus:ring-payroll/10 ${className}`}
        {...props}
      />
    </label>
  );
}