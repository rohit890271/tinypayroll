import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <nav className="flex items-center justify-between">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] text-success-action">
          TinyPayroll
        </Link>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/login" className="rounded-full px-4 py-2 text-on-surface-variant transition hover:bg-surface-container">
            Log in
          </Link>
          <Link href="/signup" className="rounded-full bg-on-surface px-4 py-2 text-surface shadow-soft transition hover:bg-success-action hover:text-on-primary">
            Start setup
          </Link>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="inline-flex rounded-full border border-success-action/30 bg-primary-container px-4 py-2 text-sm font-bold text-success-action">
            Payroll setup for tiny teams
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-[-0.05em] text-on-surface sm:text-7xl">
            Get your first payroll workspace ready before the coffee cools.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-on-surface-variant">
            TinyPayroll keeps first login focused: create your business, add employees if you are ready, and land in a calm dashboard built for small employers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="rounded-full bg-success-action px-6 py-4 text-center text-sm font-black text-on-primary shadow-soft transition hover:opacity-90">
              Create account
            </Link>
            <Link href="/login" className="rounded-full border border-outline-variant bg-surface-container-lowest px-6 py-4 text-center text-sm font-black text-on-surface transition hover:bg-surface-container">
              I already have one
            </Link>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-soft">
          <div className="rounded-[2rem] bg-inverse-surface p-5 text-inverse-on-surface">
            <div className="flex items-center justify-between border-b border-inverse-on-surface/10 pb-5">
              <div>
                <p className="text-sm text-inverse-on-surface/60">Next payroll</p>
                <p className="text-2xl font-black">Draft run</p>
              </div>
              <span className="rounded-full bg-inverse-on-surface/10 px-3 py-1 text-xs font-bold">Protected</span>
            </div>
            <div className="mt-6 grid gap-3">
              {["Business created", "Employees invited", "Payroll ready"].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-inverse-on-surface/10 p-4">
                  <span>{item}</span>
                  <span className="grid size-8 place-items-center rounded-full bg-success-action text-on-primary text-sm font-black">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}