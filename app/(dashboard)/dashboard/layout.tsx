import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getCurrentUserBusiness } from "@/lib/data/business";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, business } = await getCurrentUserBusiness();

  if (!user) {
    redirect("/login");
  }

  if (!business) {
    redirect("/onboarding/business");
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[auto_1fr]">
      <DashboardNav businessName={business.name} email={user.email ?? "Owner"} />
      <main className="rounded-[2rem] border border-ink/10 bg-white/65 p-6 shadow-soft backdrop-blur lg:p-10">{children}</main>
    </div>
  );
}