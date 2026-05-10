import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getCurrentUserBusiness } from "@/lib/data/business";
import { US_STATES } from "@/lib/onboarding/us-states";
import { createBusinessAction } from "./actions";

type BusinessOnboardingPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function BusinessOnboardingPage({ searchParams }: BusinessOnboardingPageProps) {
  const { user, business } = await getCurrentUserBusiness();

  if (!user) {
    redirect("/login");
  }

  if (business) {
    redirect("/onboarding/employees");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl place-items-center px-6 py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] text-payroll">
            TinyPayroll
          </Link>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-payroll">Step 1 of 2</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-ink">Tell us about the business.</h1>
          <p className="mt-4 text-lg leading-8 text-moss">
            This creates the workspace that anchors your employees, payroll runs, and dashboard access.
          </p>
        </section>

        <form action={createBusinessAction} className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-soft backdrop-blur sm:p-8">
          {searchParams?.error ? <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p> : null}
          <div className="grid gap-5">
            <Input label="Business name" name="name" placeholder="Oak Street Bakery" required />
            <Select label="US state" name="state" defaultValue="" required>
              <option value="" disabled>
                Choose a state
              </option>
              {US_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </Select>
            <Button type="submit">Save business</Button>
          </div>
        </form>
      </div>
    </main>
  );
}