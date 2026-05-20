import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserBusiness, getPayrollRuns } from "@/lib/data/business";

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    processed: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
    draft:     { bg: "bg-amber-50 border-amber-200",   text: "text-amber-700",   dot: "bg-amber-400" },
    failed:    { bg: "bg-red-50 border-red-200",     text: "text-red-700",     dot: "bg-red-500" },
  };
  return map[status] ?? { bg: "bg-slate-100 border-slate-200", text: "text-slate-600", dot: "bg-slate-400" };
}

export default async function PayrollPage() {
  const { user, business } = await getCurrentUserBusiness();
  if (!user) redirect("/login");
  if (!business) redirect("/onboarding");

  const runs = await getPayrollRuns(business.id);

  return (
    <section className="relative flex flex-col gap-8 pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-payroll">Payroll</p>
          <h1 className="mt-4 text-4xl font-black text-ink">Payroll runs</h1>
        </div>
        <Link
          href="/dashboard/payroll/new"
          className="inline-flex items-center gap-2 rounded-full bg-payroll px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-[#0b5d44] transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Run
        </Link>
      </div>

      <div className="mt-4">
        {runs.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center gap-5 px-6 py-20 text-center rounded-3xl border-2 border-dashed border-ink/10 bg-white/50">
            <div className="rounded-full bg-cream p-6">
              <svg className="w-12 h-12 text-moss" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 64 64">
                <rect x="8" y="12" width="48" height="40" rx="4" />
                <path d="M8 22h48" />
                <path d="M20 8v8M44 8v8" />
                <path d="M20 34h24M20 42h16" strokeLinecap="round" />
              </svg>
            </div>
            <div className="max-w-xs">
              <p className="text-lg font-bold text-ink">No payroll runs yet</p>
              <p className="mt-1 text-sm text-moss">
                Run your first payroll to calculate tax deductions and generate payslips for your team.
              </p>
            </div>
            <Link
              href="/dashboard/payroll/new"
              className="inline-flex items-center gap-2 rounded-full bg-payroll px-6 py-3 text-sm font-semibold text-white hover:bg-payroll/90 transition shadow-soft"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Run your first payroll
            </Link>
          </div>
        ) : (
          <div>
            {/* ── Desktop Table Layout ── */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/5 bg-cream/40">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-moss">Pay Period</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-moss">Run Date</th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-moss">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-moss"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {runs.map((run) => {
                    const badge = statusBadge(run.status);
                    return (
                      <tr key={run.id} className="group transition hover:bg-oat/20">
                        <td className="px-6 py-4">
                          <p className="font-bold text-ink">
                            {fmtDate(run.pay_period_start)} – {fmtDate(run.pay_period_end)}
                          </p>
                          <p className="text-xs text-moss capitalize">
                            {run.country_code === "IN" ? "Monthly" : "Bi-Weekly"} · {run.currency_code}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right text-moss font-medium">{fmtDate(run.run_date)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${badge.bg}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                            {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/payroll/${run.id}`}
                            className="text-xs font-bold text-payroll hover:underline"
                          >
                            View Details →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Card-per-Row Layout (375px responsive) ── */}
            <div className="sm:hidden space-y-4">
              {runs.map((run) => {
                const badge = statusBadge(run.status);
                return (
                  <div key={run.id} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-soft space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-ink text-base">
                          {fmtDate(run.pay_period_start)} – {fmtDate(run.pay_period_end)}
                        </p>
                        <p className="text-xs text-moss capitalize mt-0.5">
                          {run.country_code === "IN" ? "Monthly" : "Bi-Weekly"} · {run.currency_code}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${badge.bg}`}>
                        <span className={`h-1 w-1 rounded-full ${badge.dot}`} />
                        {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-ink/5 text-xs">
                      <div>
                        <span className="text-moss">Run Date:</span>
                        <span className="ml-1.5 font-semibold text-ink">{fmtDate(run.run_date)}</span>
                      </div>
                      <Link
                        href={`/dashboard/payroll/${run.id}`}
                        className="font-bold text-payroll hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}