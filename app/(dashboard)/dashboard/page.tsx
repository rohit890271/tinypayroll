import Link from "next/link";
import {
  getCurrentUserBusiness,
  getEmployeesForBusiness,
  getPayrollRuns,
} from "@/lib/data/business";
import { formatCurrency } from "@/lib/payroll/formatCurrency";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    processed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    draft:     { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
    failed:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  };
  return map[status] ?? { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const { business } = await getCurrentUserBusiness();
  const [employees, runs] = await Promise.all([
    business ? getEmployeesForBusiness(business.id) : Promise.resolve([]),
    business ? getPayrollRuns(business.id) : Promise.resolve([]),
  ]);

  const cc = (business as { country_code?: string } | null)?.country_code ?? "US";

  const lastRun   = runs[0] ?? null;
  const lastTotal = lastRun
    ? runs[0] // we'll show employer_total_cost from line_items — use net for now
    : null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <section className="relative flex flex-col gap-8 pb-24">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-payroll">Overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">
            Welcome back,{" "}
            <span className="text-payroll">{business?.name ?? "—"}</span>
          </h1>
          <p className="mt-1 text-sm text-moss">{today}</p>
        </div>
        <Link
          href="/dashboard/payroll/new"
          className="inline-flex items-center gap-2 rounded-full bg-payroll px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-payroll/90 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Run New Payroll
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Employees */}
        <div className="rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-moss">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wider">Active Employees</p>
          </div>
          <p className="mt-3 text-4xl font-black tabular-nums text-ink">{employees.length}</p>
          <p className="mt-1 text-xs text-moss/70">
            {employees.length === 0 ? "No employees yet" : `${employees.filter(e => e.pay_type === "salary").length} salaried · ${employees.filter(e => e.pay_type === "hourly").length} hourly`}
          </p>
        </div>

        {/* Last Payroll Date */}
        <div className="rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-moss">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wider">Last Payroll Date</p>
          </div>
          <p className="mt-3 text-3xl font-black text-ink">
            {lastRun ? fmtDate(lastRun.run_date) : "—"}
          </p>
          <p className="mt-1 text-xs text-moss/70">
            {lastRun ? `Period: ${fmtDate(lastRun.pay_period_start)} – ${fmtDate(lastRun.pay_period_end)}` : "No payrolls run yet"}
          </p>
        </div>

        {/* Last Payroll Total */}
        <div className="rounded-2xl border border-payroll/20 bg-payroll/5 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-payroll">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wider">Last Total Cost</p>
          </div>
          <p className="mt-3 text-3xl font-black tabular-nums text-payroll">
            {lastTotal ? "—" : "—"}
          </p>
          <p className="mt-1 text-xs text-moss/70">
            {lastRun ? `${runs.length} run${runs.length !== 1 ? "s" : ""} total` : "Employer cost incl. contributions"}
          </p>
        </div>
      </div>

      {/* ── Payroll History Table ── */}
      <div className="rounded-2xl border border-ink/10 bg-white/80 shadow-soft">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <div>
            <h2 className="font-bold text-ink">Payroll History</h2>
            <p className="text-xs text-moss">Last 10 payroll runs</p>
          </div>
          <Link
            href="/dashboard/payroll"
            className="text-xs font-semibold text-payroll hover:underline"
          >
            View all →
          </Link>
        </div>

        {runs.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
            {/* Inline SVG illustration */}
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
                Run your first payroll to see history and download payslips.
              </p>
            </div>
            <Link
              href="/dashboard/payroll/new"
              className="inline-flex items-center gap-2 rounded-full bg-payroll px-6 py-3 text-sm font-semibold text-white hover:bg-payroll/90 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Run your first payroll
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/5 bg-cream/40">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-moss">Pay Period</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-moss">Employees</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss">Run Date</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-moss">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-moss"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {runs.map((run) => {
                  const badge = statusBadge(run.status);
                  return (
                    <tr key={run.id} className="group transition hover:bg-oat/20">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">
                          {fmtDate(run.pay_period_start)} – {fmtDate(run.pay_period_end)}
                        </p>
                        <p className="text-xs text-moss capitalize">
                          {run.country_code === "IN" ? "Monthly" : "Bi-Weekly"} · {run.currency_code}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center tabular-nums text-ink">—</td>
                      <td className="px-6 py-4 text-right text-sm text-moss">{fmtDate(run.run_date)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/payroll/${run.id}`}
                          className="text-xs font-semibold text-payroll opacity-0 group-hover:opacity-100 transition hover:underline"
                        >
                          View details →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Floating FAB ── */}
      <Link
        href="/dashboard/payroll/new"
        id="fab-run-payroll"
        className="fixed bottom-8 right-8 z-30 inline-flex items-center gap-2 rounded-full bg-payroll px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_rgba(15,107,79,0.35)] hover:bg-payroll/90 hover:shadow-[0_12px_40px_rgba(15,107,79,0.45)] transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Run New Payroll
      </Link>
    </section>
  );
}