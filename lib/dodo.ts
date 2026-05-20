import DodoPayments from "dodopayments";
import { getDodoEnv } from "./env";

export function getDodoClient() {
  const { apiKey, environment } = getDodoEnv();
  return new DodoPayments({
    bearerToken: apiKey,
    environment: environment as "live_mode" | "test_mode",
  });
}
