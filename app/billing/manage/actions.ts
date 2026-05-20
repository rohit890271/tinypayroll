"use server";

import { redirect } from "next/navigation";
import { getDodoClient } from "@/lib/dodo";
import { getCurrentUserBusiness } from "@/lib/data/business";
import { getDodoEnv } from "@/lib/env";

export async function manageSubscriptionAction() {
  const { user, business } = await getCurrentUserBusiness();

  if (!user || !business || !business.dodo_customer_id) {
    redirect("/login");
  }

  const dodo = getDodoClient();
  const { returnUrl } = getDodoEnv();

  let link: string;
  try {
    const session = await dodo.customers.customerPortal.create(
      business.dodo_customer_id,
      { return_url: returnUrl }
    );
    link = session.link;
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    throw new Error("Could not redirect to billing management portal");
  }

  redirect(link);
}
