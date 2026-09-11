import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/utils/supabase/keys";

let staticClient: SupabaseClient | null = null;

/**
 * Cookie-free Supabase client for server-side read-only use (e.g. public blog data).
 * Does not call cookies() from next/headers, so pages using it can be statically generated.
 * Do not use for auth or session-dependent logic.
 */
export function getStaticSupabaseClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!staticClient) {
    staticClient = createClient(url, publishableKey, {
      auth: { persistSession: false },
    });
  }

  return staticClient;
}
