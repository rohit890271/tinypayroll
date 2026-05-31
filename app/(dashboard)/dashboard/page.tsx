import Link from "next/link";
import {
  getCurrentUserBusiness,
  getEmployeesForBusiness,
  getPayrollRuns,
  getYtdPaidTotal,
} from "@/lib/data/business";
import { formatCurrency } from "@/lib/payroll/formatCurrency";

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

export default async function DashboardPage() {
  const { business } = await getCurrentUserBusiness();
  const [employees, runs, ytdTotal] = await Promise.all([
    business ? getEmployeesForBusiness(business.id) : Promise.resolve([]),
    business ? getPayrollRuns(business.id) : Promise.resolve([]),
    business ? getYtdPaidTotal(business.id) : Promise.resolve(0),
  ]);

  const cc = (business as { country_code?: string } | null)?.country_code ?? "US";
  const lastRun = runs[0] ?? null;

  return (
    <section className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-4xl font-black tracking-tight text-primary leading-tight">
          Payroll Overview
        </h1>
        <Link
          href="/dashboard/payroll/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-success-action text-on-primary text-base font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          Run New Payroll
        </Link>
      </div>

      {/* ── Stats Row — matches Stitch 3-card layout ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">group</span>
            <p className="text-sm font-medium uppercase tracking-wider">Total Employees</p>
          </div>
          <p className="font-headline text-3xl font-bold tabular-nums text-primary">{employees.length}</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            <p className="text-sm font-medium uppercase tracking-wider">Last Payroll Date</p>
          </div>
          <p className="font-headline text-3xl font-bold text-primary">
            {lastRun ? fmtDate(lastRun.run_date) : "—"}
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <p className="text-sm font-medium uppercase tracking-wider">Total Paid (YTD)</p>
          </div>
          <p className="font-headline text-3xl font-bold tabular-nums text-primary">
            {ytdTotal > 0 ? formatCurrency(ytdTotal, cc) : "—"}
          </p>
        </div>
      </div>

      {/* ── Payroll History — matches Stitch table design ── */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="font-headline text-[22px] font-bold text-primary">Payroll History</h2>
          <Link href="/dashboard/payroll" className="text-sm font-bold text-secondary hover:underline">
            View All History
          </Link>
        </div>

        {runs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">receipt_long</span>
            <div>
              <p className="font-semibold text-on-surface">No payroll runs yet</p>
              <p className="mt-1 text-sm text-on-surface-variant">Run your first payroll to see history here.</p>
            </div>
            <Link
              href="/dashboard/payroll/new"
              className="inline-flex items-center gap-2 rounded-lg bg-success-action px-5 py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              Run First Payroll
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Pay Date</th>
                    <th className="px-6 py-4 text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-right text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Country</th>
                    <th className="px-6 py-4 text-center text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {runs.slice(0, 10).map((run) => (
                    <tr key={run.id} className="hover:bg-secondary-fixed/10 transition-colors">
                      <td className="px-6 py-5 text-on-surface text-sm font-medium">{fmtDate(run.run_date)}</td>
                      <td className="px-6 py-5 text-on-surface-variant text-sm">
                        {fmtDate(run.pay_period_start)} – {fmtDate(run.pay_period_end)}
                      </td>
                      <td className="px-6 py-5 text-right text-primary font-bold text-sm">
                        {run.country_code} · {run.currency_code}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={statusChip(run.status)}>{statusLabel(run.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex justify-end">
              <Link href="/dashboard/payroll" className="text-secondary text-sm font-bold hover:underline">
                View All History
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}