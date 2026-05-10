import Link from "next/link";
import { redirect } from "next/navigation";
import { EmployeeForm } from "@/components/onboarding/employee-form";
import { getCurrentUserBusiness, getEmployeesForBusiness } from "@/lib/data/business";
import { addEmployeeAction } from "./actions";

type EmployeesOnboardingPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function EmployeesOnboardingPage({ searchParams }: EmployeesOnboardingPageProps) {
  const { user, business } = await getCurrentUserBusiness();

  if (!user) {
    redirect("/login");
  }

  if (!business) {
    redirect("/onboarding/business");
  }

  const employees = await getEmployeesForBusiness(business.id);

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="lg:sticky lg:top-10 lg:self-start">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] text-payroll">
          TinyPayroll
        </Link>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-payroll">Step 2 of 2</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-ink">Add employees now, or come back later.</h1>
        <p className="mt-4 text-lg leading-8 text-moss">
          Employees are linked to {business.name}. You can add one, add several, or go straight to the dashboard.
        </p>
        <Link href="/dashboard" className="mt-8 inline-flex rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-black text-ink shadow-soft transition hover:bg-cream">
          Done, Go to Dashboard
        </Link>
      </section>

      <section className="grid gap-6">
        {searchParams?.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p> : null}
        <EmployeeForm action={addEmployeeAction} />

        <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-soft">
          <h2 className="text-xl font-black text-ink">Added employees</h2>
          <div className="mt-5 grid gap-3">
            {employees.length === 0 ? (
              <p className="rounded-2xl bg-cream p-4 text-sm text-moss">No employees added yet. You can still go to the dashboard.</p>
            ) : (
              employees.map((employee) => (
                <div key={employee.id} className="grid gap-2 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-black text-ink">{employee.name}</p>
                    <p className="text-sm text-moss">{employee.email}</p>
                  </div>
                  <p className="rounded-full bg-white px-3 py-1 text-sm font-bold capitalize text-payroll">{employee.pay_type}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}