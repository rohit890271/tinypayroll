import Link from "next/link";
import { getCurrentUserBusiness } from "@/lib/data/business";
import { CheckoutButton } from "./checkout-button";

export default async function PricingPage() {
  const { user, business } = await getCurrentUserBusiness();
  const isIndia = business?.country_code === "IN";
  const priceDisplay = isIndia ? "₹1,699/month" : "$20/month";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <nav className="flex items-center justify-between">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] text-payroll">
          TinyPayroll
        </Link>
        <div className="flex items-center gap-3 text-sm font-semibold">
          {user ? (
            <Link href="/dashboard" className="rounded-full bg-ink px-4 py-2 text-white shadow-soft transition hover:bg-payroll">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-moss transition hover:bg-white/70">
                Log in
              </Link>
              <Link href="/signup" className="rounded-full bg-ink px-4 py-2 text-white shadow-soft transition hover:bg-payroll">
                Start setup
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center flex-1 py-16">
        <div className="text-center max-w-3xl">
          <p className="inline-flex rounded-full border border-payroll/20 bg-white/70 px-4 py-2 text-sm font-bold text-payroll">
            Simple, Transparent Pricing
          </p>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] text-ink sm:text-6xl">
            Choose the right plan for your business.
          </h1>
          <p className="mt-4 text-lg text-moss">
            Get complete access to all features with a 7-day free trial. Cancel anytime.
          </p>
        </div>

        <div className="mt-12 w-full max-w-md rounded-[2.5rem] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
          <div className="rounded-[2rem] bg-ink p-6 text-white flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <h3 className="text-xl font-black">TinyPayroll Pro</h3>
                  <p className="text-xs text-white/60 mt-1">For growing teams</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">{priceDisplay}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Billed monthly</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  "Unlimited payroll runs",
                  "US + India multi-country support",
                  "Automatic tax calculations (TDS/PF/ESI or Federal/SS/Medicare)",
                  "PDF payslip generation + bulk download",
                  "Up to 10 employees"
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <span className="grid size-5 place-items-center rounded-full bg-payroll text-xs font-black shrink-0 mt-0.5">✓</span>
                    <span className="text-sm text-white/90 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <CheckoutButton
                isLoggedIn={!!user}
                hasBusiness={!!business}
                dodoSubscriptionId={business?.dodo_subscription_id}
                subscriptionStatus={business?.subscription_status}
              />
              <p className="mt-3 text-center text-xs text-white/40">
                No credit card required during trial
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
