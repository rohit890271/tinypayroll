export default function DashboardLoading() {
  return (
    <div className="relative flex flex-col gap-8 pb-24 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-16 rounded bg-ink/10" />
          <div className="h-9 w-64 rounded-lg bg-ink/10" />
          <div className="h-4 w-32 rounded bg-ink/10" />
        </div>
        <div className="h-11 w-36 rounded-full bg-ink/10" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-4 rounded-full bg-ink/10" />
              <div className="h-3.5 w-24 rounded bg-ink/10" />
            </div>
            <div className="h-9 w-12 rounded bg-ink/10" />
            <div className="h-3.5 w-40 rounded bg-ink/10" />
          </div>
        ))}
      </div>

      {/* History Table Skeleton */}
      <div className="rounded-2xl border border-ink/10 bg-white/80 shadow-soft">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <div className="space-y-1">
            <div className="h-4 w-32 rounded bg-ink/10" />
            <div className="h-3 w-24 rounded bg-ink/10" />
          </div>
          <div className="h-4 w-16 rounded bg-ink/10" />
        </div>
        <div className="divide-y divide-ink/5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-ink/10" />
                <div className="h-4 w-32 rounded bg-ink/10" />
              </div>
              <div className="h-4 w-20 rounded bg-ink/10" />
              <div className="h-6 w-20 rounded-full bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
