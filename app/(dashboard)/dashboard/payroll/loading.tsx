export default function PayrollLoading() {
  return (
    <section className="animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="h-4 w-20 rounded bg-ink/10" />
          <div className="mt-4 h-10 w-48 rounded-lg bg-ink/10" />
        </div>
        <div className="h-11 w-36 rounded-full bg-ink/10" />
      </div>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white/70 overflow-hidden">
        <div className="h-12 border-b border-ink/10 bg-cream/60" />
        <div className="divide-y divide-ink/5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between p-5">
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-ink/10" />
                <div className="h-4 w-32 rounded bg-ink/10" />
              </div>
              <div className="h-4 w-20 rounded bg-ink/10" />
              <div className="h-6 w-16 rounded bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
