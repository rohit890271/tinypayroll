import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/data/business";
import { manageSubscriptionAction } from "@/app/billing/manage/actions";

export default async function BillingPage() {
  const { user, business } = await getCurrentUserBusiness();

  if (!user) {
    redirect("/login?next=/dashboard/billing");
  }

  if (!business) {
    redirect("/onboarding");
  }

  const status = business.subscription_status || "inactive";
  const dodoCustomerId = business.dodo_customer_id;

  // Format status badge
  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      active: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "Active" },
      trialing: { bg: "bg-amber-50 text-amber-700 border-amber-200", text: "Trialing" },
      past_due: { bg: "bg-red-50 text-red-700 border-red-200", text: "Past Due" },
      cancelled: { bg: "bg-slate-100 text-slate-700 border-slate-200", text: "Cancelled" },
      inactive: { bg: "bg-slate-100 text-slate-700 border-slate-200", text: "No Plan" },
    };
    const badge = map[status] || map.inactive;
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${badge.bg}`}>
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
    <section className="max-w-2xl">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-payroll">Billing</p>
      <h1 className="mt-4 text-4xl font-black text-ink">Subscription</h1>

      <div className="mt-8 rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur text-moss">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h2 className="text-2xl font-black text-ink">TinyPayroll Pro</h2>
            <p className="text-sm text-moss mt-1">Billed Monthly</p>
          </div>
          <div>{getStatusBadge(status)}</div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-moss/70">Plan Status:</span>
            <span className="font-semibold capitalize text-ink">{status}</span>
          </div>
          {getBillingDateText() && (
            <div className="flex justify-between text-sm">
              <span className="text-moss/70">Billing Details:</span>
              <span className="font-semibold text-ink">{getBillingDateText()}</span>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-ink/10 flex justify-end">
          {dodoCustomerId ? (
            <form action={manageSubscriptionAction}>
              <button
                type="submit"
                className="rounded-full bg-payroll px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-payroll/90 transition"
              >
                Manage Subscription
                  </button>
                </form>
              ) : (
            <Link
              href="/pricing"
              className="rounded-full bg-payroll px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-payroll/90 transition"
            >
              Start Subscription
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}