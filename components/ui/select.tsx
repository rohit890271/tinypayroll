import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ className = "", label, children, ...props }: SelectProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-on-surface">
      <span>{label}</span>
      <select
        className={`rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface outline-none transition focus:border-success-action focus:ring-4 focus:ring-success-action/10 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}