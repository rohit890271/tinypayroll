import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ className = "", label, ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-on-surface">
      <span>{label}</span>
      <input
        className={`rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface outline-none transition placeholder:text-on-surface-variant/60 focus:border-success-action focus:ring-4 focus:ring-success-action/10 ${className}`}
        {...props}
      />
    </label>
  );
}