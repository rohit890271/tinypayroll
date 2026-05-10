import { getStripePublishableKey } from "@/lib/env";

export function getStripeClientConfig() {
  return {
    publishableKey: getStripePublishableKey()
  };
}