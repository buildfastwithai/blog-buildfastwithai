/**
 * Cookie-based Supabase client for server actions and route handlers ONLY.
 *
 * There is deliberately NO session-refresh middleware (proxy.ts) in this app.
 * Pages are cached at the CDN (ISR / CloudFront). A middleware that refreshes
 * tokens attaches `Set-Cookie: sb-…-auth-token=<that user's session>` to the
 * page response, and a shared cache then hands that cookie — and that login —
 * to every other visitor. This happened in production. Never reintroduce it.
 *
 * Sessions stay fresh without it: the browser client auto-refreshes and
 * persists cookies, and this server client refreshes inside server actions
 * (POST, never cached) via setAll below.
 */
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/utils/supabase/keys";

function createClientFromCookieStore(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  return createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

function hasSupabaseAuthCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  return cookieStore.getAll().some(({ name }) => {
    return (
      name.startsWith("sb-") &&
      (name.endsWith("-auth-token") || name.includes("-auth-token."))
    );
  });
}

export async function createClient() {
  const cookieStore = await cookies();

  return createClientFromCookieStore(cookieStore);
}

export async function getOptionalUser(): Promise<User | null> {
  const cookieStore = await cookies();

  if (!hasSupabaseAuthCookie(cookieStore)) {
    return null;
  }

  const supabase = createClientFromCookieStore(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error?.name === "AuthSessionMissingError") {
    return null;
  }

  if (error) {
    console.error("[Supabase Auth] Error getting optional user:", error);
    return null;
  }

  return user;
}
