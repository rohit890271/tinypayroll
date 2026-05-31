import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/data/business";
import { manageSubscriptionAction } from "./actions";

export default async function ManageBillingPage() {
  const { user, business } = await getCurrentUserBusiness();

  if (!user) {
    redirect("/login?next=/billing/manage");
  }

  if (!business) {
    redirect("/onboarding");
  }

  const status = business.subscription_status || "inactive";
  const dodoCustomerId = business.dodo_customer_id;

  // Format status badge — semantic tokens so it adapts in both themes.
  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; text: string }> = {
      active: { cls: "bg-primary-container border-success-action/30 text-success-action", text: "Active" },
      trialing: { cls: "bg-tertiary-container border-tertiary/30 text-tertiary", text: "Trialing" },
      past_due: { cls: "bg-error-container border-error/30 text-error", text: "Past Due" },
      cancelled: { cls: "bg-surface-container border-outline-variant text-on-surface-variant", text: "Cancelled" },
      inactive: { cls: "bg-surface-container border-outline-variant text-on-surface-variant", text: "No Plan" },
    };
    const badge = map[status] || map.inactive;
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${badge.cls}`}>
        {badge.text}
      </span>
    );
  };

  const getBillingDateText = () => {
    if (status === "trialing" && business.trial_ends_at) {
      return `Trial ends on ${new Date(business.trial_ends_at).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;
    }
    if (status === "active" && business.subscription_ends_at) {
      return `Next billing date: ${new Date(business.subscription_ends_at).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;
    }
    return null;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <nav className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-black uppercase tracking-[0.3em] text-success-action">
          TinyPayroll
        </Link>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/dashboard" className="rounded-full bg-surface-container-lowest px-4 py-2 text-on-surface-variant transition hover:bg-surface-container">
            Dashboard
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center flex-1 py-16">
        <div className="text-center max-w-3xl">
          <p className="inline-flex rounded-full border border-success-action/30 bg-primary-container px-4 py-2 text-sm font-bold text-success-action">
            Billing Management
          </p>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] text-on-surface sm:text-6xl">
            Manage your subscription.
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Update payment methods, view invoices, or change plan settings.
          </p>
        </div>

        <div className="mt-12 w-full max-w-md rounded-[2.5rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-soft">
          <div className="rounded-[2rem] bg-inverse-surface p-6 text-inverse-on-surface flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-inverse-on-surface/10 pb-5">
                <div>
                  <h3 className="text-xl font-black">TinyPayroll Pro</h3>
                  <p className="text-xs text-inverse-on-surface/60 mt-1">Billed Monthly</p>
                </div>
                <div>{getStatusBadge(status)}</div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-inverse-on-surface/60">Status:</span>
                  <span className="font-semibold capitalize text-inverse-on-surface/90">{status}</span>
                </div>
                {getBillingDateText() && (
                  <div className="flex justify-between text-sm">
                    <span className="text-inverse-on-surface/60">Details:</span>
                    <span className="font-semibold text-inverse-on-surface/90">{getBillingDateText()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-inverse-on-surface/10">
              {dodoCustomerId ? (
                <form action={manageSubscriptionAction}>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-success-action py-4 text-center text-sm font-black text-on-primary shadow-soft transition hover:opacity-90"
                  >
                    Manage Subscription
                  </button>
                </form>
              ) : (
                <Link
                  href="/pricing"
                  className="block w-full rounded-full bg-success-action py-4 text-center text-sm font-black text-on-primary shadow-soft transition hover:opacity-90"
                >
                  Start Subscription
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
