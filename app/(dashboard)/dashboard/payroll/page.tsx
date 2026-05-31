import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserBusiness, getPayrollRuns } from "@/lib/data/business";

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function statusChip(status: string) {
  if (status === "processed")
    return "inline-flex items-center rounded-full bg-primary-container border border-success-action/30 px-3 py-1 text-xs font-bold text-success-action";
  if (status === "draft")
    return "inline-flex items-center rounded-full bg-tertiary-container border border-tertiary/30 px-3 py-1 text-xs font-bold text-tertiary";
  return "inline-flex items-center rounded-full bg-surface-container border border-outline-variant px-3 py-1 text-xs font-bold text-on-surface-variant";
}

function statusLabel(status: string) {
  if (status === "processed") return "Paid";
  if (status === "draft") return "Processing";
  return status;
}

export default async function PayrollPage() {
  const { user, business } = await getCurrentUserBusiness();
  if (!user) redirect("/login");
  if (!business) redirect("/onboarding");

  const runs = await getPayrollRuns(business.id);

  return (
    <section className="flex flex-col gap-6 pb-24">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-4xl font-black tracking-tight text-primary leading-tight">
          Payroll Runs
        </h1>
        <Link
          href="/dashboard/payroll/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-success-action text-on-primary text-base font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          New Run
        </Link>
      </div>

      <div className="mt-4">
        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-outline-variant py-20 text-center bg-surface-container-lowest shadow-card">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">receipt_long</span>
            <div>
              <h3 className="font-headline text-lg font-black text-primary">No payroll runs yet</h3>
              <p className="mt-1 text-sm text-on-surface-variant max-w-sm">
                Run your first payroll to calculate tax deductions and generate payslips for your team.
              </p>
            </div>
            <Link
              href="/dashboard/payroll/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-success-action px-6 py-3 text-sm font-bold text-on-primary shadow-soft hover:opacity-90 transition"
            >
              Run your first payroll
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Pay Date</th>
                    <th className="px-6 py-4 text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-right text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Country</th>
                    <th className="px-6 py-4 text-center text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-on-surface-variant text-sm font-semibold uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {runs.map((run) => (
                    <tr key={run.id} className="hover:bg-secondary-fixed/10 transition-colors">
                      <td className="px-6 py-5 text-on-surface text-sm font-bold">{fmtDate(run.run_date)}</td>
                      <td className="px-6 py-5 text-on-surface-variant text-sm">
                        {fmtDate(run.pay_period_start)} – {fmtDate(run.pay_period_end)}
                      </td>
                      <td className="px-6 py-5 text-right text-primary font-bold text-sm">
                        {run.country_code} · {run.currency_code}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={statusChip(run.status)}>{statusLabel(run.status)}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/dashboard/payroll/${run.id}`}
                          className="text-secondary text-sm font-bold hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}