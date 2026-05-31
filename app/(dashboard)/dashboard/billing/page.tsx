import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/data/business";
import { ManageButton } from "./manage-button";

export default async function BillingPage() {
  const { user, business } = await getCurrentUserBusiness();

  if (!user) {
    redirect("/login?next=/dashboard/billing");
  }

  if (!business) {
    redirect("/onboarding");
  }

  const status = business.subscription_status || "inactive";

  if (status !== "active" && status !== "trialing") {
    redirect("/pricing");
  }

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border";
    if (status === "active")
      return <span className={`${base} bg-primary-container border-success-action/30 text-success-action`}>Active</span>;
    if (status === "trialing")
      return <span className={`${base} bg-tertiary-container border-tertiary/30 text-tertiary`}>Trialing</span>;
    if (status === "past_due")
      return <span className={`${base} bg-error-container border-error/30 text-error`}>Past Due</span>;

    return <span className={`${base} bg-surface-container border-outline-variant text-on-surface-variant`}>No Plan</span>;
  };

  const getBillingDateText = () => {
    if (status === "trialing" && business.trial_ends_at) {
      return `Trial ends on ${new Date(business.trial_ends_at).toLocaleDateString("en-US", {
        day: "numeric", month: "long", year: "numeric",
      })}`;
    }
    if (status === "active" && business.subscription_ends_at) {
      return `Next billing date: ${new Date(business.subscription_ends_at).toLocaleDateString("en-US", {
        day: "numeric", month: "long", year: "numeric",
      })}`;
    }
    return null;
  };

  return (
    <section className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-4xl font-black tracking-tight text-primary leading-tight">
          Subscription
        </h1>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary">credit_score</span>
            <div>
              <h2 className="font-headline text-2xl font-black text-primary">TinyPayroll Pro</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">Billed Monthly</p>
            </div>
          </div>
          <div>{getStatusBadge(status)}</div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Plan Status:</span>
            <span className="font-semibold capitalize text-on-surface">{status}</span>
          </div>
          {getBillingDateText() && (
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Billing Details:</span>
              <span className="font-semibold text-on-surface">{getBillingDateText()}</span>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant flex justify-end">
          <ManageButton />
        </div>
      </div>
    </section>
  );
}