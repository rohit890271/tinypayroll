import Link from "next/link";
import { getCurrentUserBusiness, getEmployeesForBusiness } from "@/lib/data/business";
import { formatCurrency } from "@/lib/payroll/formatCurrency";

export default async function EmployeesPage() {
  const { business } = await getCurrentUserBusiness();
  const employees = business ? await getEmployeesForBusiness(business.id) : [];
  const cc = business?.country_code ?? "US";

  return (
    <section className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-4xl font-black tracking-tight text-primary leading-tight">
          Team Members
        </h1>
        <Link
          href="/onboarding/employees"
          className="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-success-action text-on-primary text-base font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Employee
        </Link>
      </div>

      <div className="mt-4">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-outline-variant py-20 text-center bg-surface-container-lowest shadow-card">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">group</span>
            <div>
              <h3 className="font-headline text-lg font-black text-primary">No employees yet</h3>
              <p className="mt-1 text-sm text-on-surface-variant max-w-sm">
                Add your team members to start managing hourly logs, salary cycles, and compliant tax filings.
              </p>
            </div>
            <Link
              href="/onboarding/employees"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-success-action px-6 py-3 text-sm font-bold text-on-primary shadow-soft hover:opacity-90 transition"
            >
              Add your first employee
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-on-surface-variant text-sm font-semibold uppercase tracking-wider text-center">Pay Type</th>
                    <th className="px-6 py-4 text-right text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-secondary-fixed/10 transition-colors">
                      <td className="px-6 py-5 text-on-surface text-sm font-bold">{employee.name}</td>
                      <td className="px-6 py-5 text-on-surface-variant text-sm">{employee.email}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center rounded-full bg-primary-container px-3 py-1 text-xs font-bold capitalize text-primary border border-outline-variant/30">
                          {employee.pay_type}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-sm text-primary tabular-nums">
                        {employee.pay_type === "hourly"
                          ? `${formatCurrency(employee.hourly_rate ?? 0, cc)} / hr`
                          : `${formatCurrency((employee.annual_salary ?? 0) / 12, cc)} / mo`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}