import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/utils/supabase/keys";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const secretKey = getSupabaseSecretKey();

  if (!adminClient) {
    adminClient = createClient(url, secretKey, {
      auth: { persistSession: false },
    });
  }

  return adminClient;
}
