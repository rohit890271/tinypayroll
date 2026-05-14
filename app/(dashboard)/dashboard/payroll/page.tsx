import Link from "next/link";

export default function PayrollPage() {
  return (
    <section>
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
          New Payroll Run
        </Link>
      </div>
      <div className="mt-8 rounded-3xl bg-cream p-6 text-moss">
        Draft and processed payroll runs will appear here once payroll calculations are added.
      </div>
    </section>
  );
}