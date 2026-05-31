import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDodoEnv } from "@/lib/env";
import { processReferralReward } from "@/lib/referral/reward";

export async function POST(req: Request) {
  try {
    const { webhookSecret } = getDodoEnv();
    const payload = await req.text();

    const headers = {
      "webhook-id": req.headers.get("webhook-id") || "",
      "webhook-signature": req.headers.get("webhook-signature") || "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
    };

    const wh = new Webhook(webhookSecret);
    try {
      wh.verify(payload, headers);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(payload);
    const eventType = event.type;
    const data = event.data;

    const supabase = createAdminClient();

    // Idempotency: claim this webhook-id before doing any work. A replay/retry
    // hits the primary-key conflict (23505) and is acknowledged without
    // reprocessing. Missing header → process normally (can't dedup).
    const webhookId = headers["webhook-id"];
    if (webhookId) {
      const { error: dedupErr } = await supabase
        .from("processed_webhooks")
        .insert({ webhook_id: webhookId, event_type: eventType });
      if (dedupErr) {
        if (dedupErr.code === "23505") {
          return NextResponse.json({ received: true, duplicate: true });
        }
        // Non-conflict insert error: log and continue (don't drop the event).
        console.error("Webhook dedup insert error:", dedupErr.message);
      }
    } else {
      console.warn("Webhook missing webhook-id header; processing without dedup.");
    }

    const dodoCustomerId = data.customer?.customer_id;
    if (!dodoCustomerId) {
      console.warn("No customer_id found in webhook payload:", eventType);
      return NextResponse.json({ received: true });
    }

    const updateData: any = {};
    if (data.subscription_id) {
      updateData.dodo_subscription_id = data.subscription_id;
    }

    switch (eventType) {
      case "subscription.created":
        updateData.subscription_status = "trialing";
        if (data.next_billing_date) {
          updateData.trial_ends_at = data.next_billing_date;
        }
        break;
      case "subscription.active":
      case "subscription.renewed":
        updateData.subscription_status = "active";
        if (data.next_billing_date) {
          updateData.subscription_ends_at = data.next_billing_date;
        }
        break;
      case "subscription.cancelled":
        updateData.subscription_status = "cancelled";
        break;
      case "subscription.failed":
        updateData.subscription_status = "past_due";
        break;
      case "payment.succeeded":
        if (data.subscription_id) {
          updateData.subscription_status = "active";
        }
        // Process the referral reward in-process (never throws / never blocks the 200).
        try {
          await processReferralReward(dodoCustomerId);
        } catch (e: any) {
          console.error("Referral reward error:", e?.message ?? e);
        }
        break;
      case "payment.failed":
        if (data.subscription_id) {
          updateData.subscription_status = "past_due";
        }
        break;
      default:
        // Ignore other events
        return NextResponse.json({ received: true });
    }

    // Update business table in DB
    const { error: dbError } = await supabase
      .from("businesses")
      .update(updateData)
      .eq("dodo_customer_id", dodoCustomerId);

    if (dbError) {
      console.error("Database update error in webhook:", dbError.message);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    // Always return 200 on server errors to prevent retry storms
    return NextResponse.json({ received: true });
  }
}
