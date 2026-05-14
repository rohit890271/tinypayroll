import { notFound, redirect } from "next/navigation";
import { getCurrentUserBusiness, getPayrollRunDetail } from "@/lib/data/business";
import { RunDetailClient } from "./run-detail-client";

export default async function PayrollRunPage({ params }: { params: { id: string } }) {
  const { user, business } = await getCurrentUserBusiness();

  if (!user) redirect("/login");
  if (!business) redirect("/onboarding/business");

  const runDetail = await getPayrollRunDetail(params.id, business.id);

  if (!runDetail) {
    return notFound();
  }

  // To build PayslipData, we need `business` cast to `BusinessWithCountry`
  const businessWithCountry = {
    ...business,
    country_code: runDetail.run.country_code,
    currency_code: runDetail.run.currency_code,
  };

  return (
    <RunDetailClient
      run={runDetail.run}
      lineItems={runDetail.lineItems}
      business={businessWithCountry}
    />
  );
}
