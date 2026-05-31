import { getCurrentUserBusiness } from "@/lib/data/business";

export default async function SettingsPage() {
  const { business } = await getCurrentUserBusiness();

  return (
    <section>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-success-action">Settings</p>
      <h1 className="mt-4 text-4xl font-black text-on-surface">Company settings</h1>
      <div className="mt-8 grid gap-4 rounded-3xl bg-surface-container-low border border-outline-variant p-6 text-on-surface-variant">
        <p><span className="font-bold text-on-surface">Business:</span> {business?.name}</p>
        <p><span className="font-bold text-on-surface">State:</span> {business?.state}</p>
      </div>
    </section>
  );
}