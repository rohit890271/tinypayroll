import { getCurrentUserBusiness } from "@/lib/data/business";

export default async function SettingsPage() {
  const { business } = await getCurrentUserBusiness();

  return (
    <section>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-payroll">Settings</p>
      <h1 className="mt-4 text-4xl font-black text-ink">Company settings</h1>
      <div className="mt-8 grid gap-4 rounded-3xl bg-cream p-6 text-moss">
        <p><span className="font-bold text-ink">Business:</span> {business?.name}</p>
        <p><span className="font-bold text-ink">State:</span> {business?.state}</p>
      </div>
    </section>
  );
}