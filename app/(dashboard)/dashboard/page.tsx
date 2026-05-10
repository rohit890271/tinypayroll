import Link from "next/link";
import { getCurrentUserBusiness, getEmployeesForBusiness } from "@/lib/data/business";

export default async function DashboardPage() {
  const { business } = await getCurrentUserBusiness();
  const employees = business ? await getEmployeesForBusiness(business.id) : [];

  return (
    <section>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-payroll">Overview</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-ink">Payroll home base</h1>
      <p className="mt-3 max-w-2xl text-moss">Your TinyPayroll workspace is ready. Add employees, prepare payroll runs, and connect billing when you are ready.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-cream p-5">
          <p className="text-sm font-semibold text-moss">Business</p>
          <p className="mt-2 text-2xl font-black text-ink">{business?.name}</p>
        </div>
        <div className="rounded-3xl bg-cream p-5">
          <p className="text-sm font-semibold text-moss">Employees</p>
          <p className="mt-2 text-2xl font-black text-ink">{employees.length}</p>
        </div>
        <div className="rounded-3xl bg-cream p-5">
          <p className="text-sm font-semibold text-moss">Status</p>
          <p className="mt-2 text-2xl font-black text-ink">Ready</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard/employees" className="rounded-full bg-payroll px-5 py-3 text-center text-sm font-bold text-white hover:bg-[#0b5d44]">
          Manage employees
        </Link>
        <Link href="/dashboard/payroll" className="rounded-full border border-ink/15 bg-white px-5 py-3 text-center text-sm font-bold text-ink hover:bg-cream">
          View payroll runs
        </Link>
      </div>
    </section>
  );
}