"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: "dashboard",
    exact: true,
  },
  {
    href: "/dashboard/employees",
    label: "Employees",
    icon: "group",
  },
  {
    href: "/dashboard/payroll",
    label: "Payroll",
    icon: "payments",
  },
  {
    href: "/dashboard/referral",
    label: "Referral",
    icon: "share",
  },
  {
    href: "/dashboard/billing",
    label: "Billing",
    icon: "credit_card",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: "settings",
  },
];

type DashboardNavProps = {
  businessName: string;
  email: string;
};

export function DashboardNav({ businessName, email }: DashboardNavProps) {
  const pathname = usePathname();

  function isActive(item: (typeof navItems)[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="flex flex-col gap-0 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card lg:min-h-[calc(100vh-3rem)] lg:w-64 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
          <svg fill="none" viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-headline text-sm font-bold text-primary tracking-tight">TinyPayroll</span>
      </div>

      {/* Business info */}
      <div className="border-b border-outline-variant px-5 py-4">
        <p className="text-sm font-semibold text-on-surface truncate">{businessName}</p>
        <p className="mt-0.5 truncate text-xs text-on-surface-variant">{email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-surface-container-high text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${active ? "text-primary" : ""}`}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-success-action" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-outline-variant p-3 flex flex-col gap-3">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </aside>
  );
}