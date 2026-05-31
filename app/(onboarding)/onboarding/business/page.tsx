import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/data/business";
import { detectUserCountry } from "@/lib/detectCountry";
import { BusinessForm } from "./business-form";

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

  // Detect country code server-side (default to "US")
  const countryCode = await detectUserCountry();

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl place-items-center px-6 py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] text-success-action">
            TinyPayroll
          </Link>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-success-action">Step 1 of 2</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-on-surface">Tell us about the business.</h1>
          <p className="mt-4 text-lg leading-8 text-on-surface-variant">
            This creates the workspace that anchors your employees, payroll runs, and dashboard access.
          </p>
        </section>

        <div className="w-full">
          {searchParams?.error ? (
            <p className="mb-5 rounded-2xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
              {searchParams.error}
            </p>
          ) : null}
          <BusinessForm initialCountryCode={countryCode} />
        </div>
      </div>
    </main>
  );
}