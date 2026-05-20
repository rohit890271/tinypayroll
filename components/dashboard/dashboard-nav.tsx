import Link from "next/link";
import { LogoutButton } from "@/components/dashboard/logout-button";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/employees", label: "Employees" },
  { href: "/dashboard/payroll", label: "Payroll" },
  { href: "/dashboard/referral", label: "Referral" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" }
];

type DashboardNavProps = {
  businessName: string;
  email: string;
};

export function DashboardNav({ businessName, email }: DashboardNavProps) {
  return (
    <aside className="flex flex-col gap-6 rounded-[2rem] border border-ink/10 bg-white/80 p-5 shadow-soft lg:min-h-[calc(100vh-3rem)] lg:w-72">
      <div>
        <Link href="/dashboard" className="text-sm font-bold uppercase tracking-[0.25em] text-payroll">
          TinyPayroll
        </Link>
        <h2 className="mt-4 text-xl font-black text-ink">{businessName}</h2>
        <p className="mt-1 truncate text-sm text-moss">{email}</p>
      </div>

      <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink transition hover:bg-cream">
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}