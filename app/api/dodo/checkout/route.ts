import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDodoClient } from "@/lib/dodo";
import { getDodoEnv } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, dodo_customer_id, subscription_status")
      .eq("owner_user_id", user.id)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Guard: don't create a new checkout for an already-active or trialing subscription.
    if (
      business.subscription_status === "active" ||
      business.subscription_status === "trialing"
    ) {
      return NextResponse.json(
        { error: "Subscription already active", redirect: "/dashboard" },
        { status: 409 }
      );
    }

    const dodo = getDodoClient();
    const { productId, returnUrl } = getDodoEnv();

    let dodoCustomerId = business.dodo_customer_id;

    if (!dodoCustomerId) {
      // Create customer first
      const dodoCustomer = await dodo.customers.create({
        email: user.email || "",
        name: business.name,
      });
      dodoCustomerId = dodoCustomer.customer_id;

      // Save it in the database
      const { error: updateError } = await supabase
        .from("businesses")
        .update({ dodo_customer_id: dodoCustomerId })
        .eq("id", business.id);

      if (updateError) {
        console.error("Error updating dodo_customer_id in businesses:", updateError.message);
        // Continue anyway since we have the customer ID
      }
    }

    // Create subscription checkout
    const session = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        customer_id: dodoCustomerId,
      },
      subscription_data: {
        trial_period_days: 7,
      },
      return_url: returnUrl,
    });

    if (!session.checkout_url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (error: any) {
    console.error("Dodo Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
