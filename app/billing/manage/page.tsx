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

  // Format status badge
  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      active: { bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", text: "Active" },
      trialing: { bg: "bg-amber-500/10 border-amber-500/20 text-amber-400", text: "Trialing" },
      past_due: { bg: "bg-red-500/10 border-red-500/20 text-red-400", text: "Past Due" },
      cancelled: { bg: "bg-slate-500/10 border-slate-500/20 text-slate-400", text: "Cancelled" },
      inactive: { bg: "bg-slate-500/10 border-slate-500/20 text-slate-400", text: "No Plan" },
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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <nav className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-black uppercase tracking-[0.3em] text-payroll">
          TinyPayroll
        </Link>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/dashboard" className="rounded-full bg-white/70 px-4 py-2 text-moss transition hover:bg-white/90">
            Dashboard
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center flex-1 py-16">
        <div className="text-center max-w-3xl">
          <p className="inline-flex rounded-full border border-payroll/20 bg-white/70 px-4 py-2 text-sm font-bold text-payroll">
            Billing Management
          </p>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] text-ink sm:text-6xl">
            Manage your subscription.
          </h1>
          <p className="mt-4 text-lg text-moss">
            Update payment methods, view invoices, or change plan settings.
          </p>
        </div>

        <div className="mt-12 w-full max-w-md rounded-[2.5rem] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
          <div className="rounded-[2rem] bg-ink p-6 text-white flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <h3 className="text-xl font-black">TinyPayroll Pro</h3>
                  <p className="text-xs text-white/60 mt-1">Billed Monthly</p>
                </div>
                <div>{getStatusBadge(status)}</div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Status:</span>
                  <span className="font-semibold capitalize text-white/90">{status}</span>
                </div>
                {getBillingDateText() && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Details:</span>
                    <span className="font-semibold text-white/90">{getBillingDateText()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              {dodoCustomerId ? (
                <form action={manageSubscriptionAction}>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-payroll py-4 text-center text-sm font-black text-white shadow-soft transition hover:bg-[#0b5d44]"
                  >
                    Manage Subscription
                  </button>
                </form>
              ) : (
                <Link
                  href="/pricing"
                  className="block w-full rounded-full bg-payroll py-4 text-center text-sm font-black text-white shadow-soft transition hover:bg-[#0b5d44]"
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
