import Link from "next/link";
import { getCurrentUserBusiness, getEmployeesForBusiness } from "@/lib/data/business";

export default async function EmployeesPage() {
  const { business } = await getCurrentUserBusiness();
  const employees = business ? await getEmployeesForBusiness(business.id) : [];

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-payroll">Employees</p>
          <h1 className="mt-4 text-4xl font-black text-ink">Team list</h1>
        </div>
        <Link href="/onboarding/employees" className="rounded-full bg-payroll px-5 py-3 text-sm font-bold text-white hover:bg-[#0b5d44]">
          Add employee
        </Link>
      </div>

      <div className="mt-8 grid gap-3">
        {employees.length === 0 ? (
          <div className="rounded-3xl bg-cream p-6 text-moss">No employees yet. Add the first one when you are ready.</div>
        ) : (
          employees.map((employee) => (
            <div key={employee.id} className="grid gap-2 rounded-3xl border border-ink/10 bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-black text-ink">{employee.name}</p>
                <p className="text-sm text-moss">{employee.email}</p>
              </div>
              <p className="rounded-full bg-cream px-3 py-1 text-sm font-bold capitalize text-payroll">{employee.pay_type}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}