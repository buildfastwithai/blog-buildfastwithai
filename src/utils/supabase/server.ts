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
