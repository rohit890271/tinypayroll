import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminEnv } from "@/lib/env";

export function createAdminClient() {
  const { url, serviceKey } = getSupabaseAdminEnv();
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
