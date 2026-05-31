import type { ButtonHTMLAttributes } from "react";

const variantClasses = {
  primary: "bg-success-action text-on-primary shadow-soft hover:opacity-90 disabled:opacity-50",
  secondary: "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container disabled:opacity-50",
  ghost: "text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
  loading?: boolean;
};

export function Button({ className = "", variant = "primary", loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}