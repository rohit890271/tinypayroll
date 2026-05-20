export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!anonKey) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}

export function getSupabaseAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!serviceKey) {
    throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");
  }

  return { url, serviceKey };
}

export function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
  }
  return key;
}

export function getStripePublishableKey() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  }
  return key;
}

export function getDodoEnv() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT;
  const returnUrl = process.env.DODO_PAYMENTS_RETURN_URL;

  if (!apiKey) throw new Error("Missing required environment variable: DODO_PAYMENTS_API_KEY");
  if (!webhookSecret) throw new Error("Missing required environment variable: DODO_WEBHOOK_SECRET");
  if (!productId) throw new Error("Missing required environment variable: DODO_PAYMENTS_PRODUCT_ID");
  if (!environment) throw new Error("Missing required environment variable: DODO_PAYMENTS_ENVIRONMENT");
  if (!returnUrl) throw new Error("Missing required environment variable: DODO_PAYMENTS_RETURN_URL");

  return { apiKey, webhookSecret, productId, environment, returnUrl };
}