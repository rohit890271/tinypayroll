import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getCurrentUserBusiness } from "@/lib/data/business";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, business } = await getCurrentUserBusiness();

  if (!user) redirect("/login");
  if (!business) redirect("/onboarding/business");

  return (
    <div className="flex min-h-screen bg-surface font-body">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 p-3">
        <DashboardNav businessName={business.name} email={user.email ?? "Owner"} />
      </div>

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-outline-variant bg-surface-container-lowest px-4 py-3 flex items-center justify-between">
        <span className="font-headline text-sm font-bold text-primary">TinyPayroll</span>
        <span className="text-xs text-on-surface-variant truncate max-w-[160px]">{business.name}</span>
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-[container-max] px-4 py-6 lg:px-8 lg:py-8 mt-[56px] lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}