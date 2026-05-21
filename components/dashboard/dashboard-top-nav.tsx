"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/dashboard/logout-button";

const navItems = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/employees", label: "Employees" },
  { href: "/dashboard/payroll", label: "Payroll" },
  { href: "/dashboard/referral", label: "Refer & Earn" },
  { href: "/dashboard/billing", label: "Billing" },
];

export function DashboardTopNav({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  function isActive(item: (typeof navItems)[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <header className="flex flex-col gap-4 border-b border-solid border-outline-variant px-4 md:px-10 py-4 bg-surface-container-lowest rounded-t-xl shadow-sm">
      {/* Top Row: Logo & Logout */}
      <div className="flex items-center justify-between whitespace-nowrap">
        <div className="flex items-center gap-4 text-primary">
          <div className="flex size-8 items-center justify-center text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <path fillRule="evenodd" clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="font-headline text-lg font-bold leading-tight tracking-[-0.015em]">{businessName}</h2>
        </div>
        <LogoutButton />
      </div>

      {/* Bottom Row: Navigation */}
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                active
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
