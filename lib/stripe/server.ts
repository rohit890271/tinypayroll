import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/env";

export function createStripeClient() {
  return new Stripe(getStripeSecretKey(), {
    apiVersion: "2025-02-24.acacia"
  });
}
