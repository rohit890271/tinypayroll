import Link from "next/link";
import { getCurrentUserBusiness, getEmployeesForBusiness } from "@/lib/data/business";
import { formatCurrency } from "@/lib/payroll/formatCurrency";

export default async function EmployeesPage() {
  const { business } = await getCurrentUserBusiness();
  const employees = business ? await getEmployeesForBusiness(business.id) : [];
  const cc = business?.country_code ?? "US";

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-payroll">Employees</p>
          <h1 className="mt-4 text-4xl font-black text-ink">Team list</h1>
        </div>
        <Link href="/onboarding/employees" className="rounded-full bg-payroll px-5 py-3 text-sm font-bold text-white hover:bg-[#0b5d44] transition">
          Add employee
        </Link>
      </div>

      <div className="mt-8">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-ink/10 py-20 text-center bg-white/50">
            <div className="rounded-full bg-oat p-4">
              <svg className="w-12 h-12 text-moss" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-ink">No employees yet</h3>
              <p className="mt-1 text-sm text-moss max-w-sm">
                Add your team members to start managing hourly logs, salary cycles, and compliant tax filings.
              </p>
            </div>
            <Link
              href="/onboarding/employees"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-payroll px-6 py-3 text-sm font-bold text-white shadow-soft hover:bg-[#0b5d44] transition"
            >
              Add your first employee
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
            <table className="w-full border-collapse text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-ink/10 bg-cream/60">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-moss">Name</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-moss">Email</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-moss">Pay Type</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-moss">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {employees.map((employee) => (
                  <tr key={employee.id} className="bg-white/40 hover:bg-white/80 transition">
                    <td className="px-5 py-4 font-black text-ink">{employee.name}</td>
                    <td className="px-5 py-4 text-moss">{employee.email}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-cream px-3 py-1 text-xs font-bold capitalize text-payroll border border-payroll/15">
                        {employee.pay_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink">
                      {employee.pay_type === "hourly"
                        ? `${formatCurrency(employee.hourly_rate ?? 0, cc)}/hr`
                        : `${formatCurrency((employee.annual_salary ?? 0) / 12, cc)}/mo`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}