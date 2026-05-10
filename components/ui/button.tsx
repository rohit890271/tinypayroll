import type { ButtonHTMLAttributes } from "react";

const variantClasses = {
  primary: "bg-payroll text-white shadow-soft hover:bg-[#0b5d44]",
  secondary: "border border-ink/15 bg-white text-ink hover:bg-cream",
  ghost: "text-moss hover:bg-oat/70"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}