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
        <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] text-success-action">
          TinyPayroll
        </Link>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-success-action">Step 2 of 2</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-on-surface">Add employees now, or come back later.</h1>
        <p className="mt-4 text-lg leading-8 text-on-surface-variant">
          Employees are linked to {business.name}. You can add one, add several, or go straight to the dashboard.
        </p>
        <Link href="/dashboard" className="mt-8 inline-flex rounded-full border border-outline-variant bg-surface-container-lowest px-5 py-3 text-sm font-black text-on-surface shadow-soft transition hover:bg-surface-container">
          Done, Go to Dashboard
        </Link>
      </section>

      <section className="grid gap-6">
        <EmployeeForm action={addEmployeeAction} />

        <div className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
          <h2 className="text-xl font-black text-on-surface">Added employees</h2>
          <div className="mt-5 grid gap-3">
            {employees.length === 0 ? (
              <p className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">No employees added yet. You can still go to the dashboard.</p>
            ) : (
              employees.map((employee) => (
                <div key={employee.id} className="grid gap-2 rounded-2xl bg-surface-container-low p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-black text-on-surface">{employee.name}</p>
                    <p className="text-sm text-on-surface-variant">{employee.email}</p>
                  </div>
                  <p className="rounded-full bg-primary-container px-3 py-1 text-sm font-bold capitalize text-success-action">{employee.pay_type}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}