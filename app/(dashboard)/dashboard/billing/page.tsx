import { getStripeClientConfig } from "@/lib/stripe/client";

export default function BillingPage() {
  let stripeStatus = "Stripe publishable key not loaded during static render.";

  try {
    getStripeClientConfig();
    stripeStatus = "Stripe publishable key is configured.";
  } catch {
    stripeStatus = "Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable billing UI.";
  }

  return (
    <section>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-payroll">Billing</p>
      <h1 className="mt-4 text-4xl font-black text-ink">Subscription</h1>
      <div className="mt-8 rounded-3xl bg-cream p-6 text-moss">{stripeStatus}</div>
    </section>
  );
}