import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { headers } from "next/headers";

export type LoginMethod = "google" | "email_password" | "email_link";
export type LoginType = "sign_in" | "sign_up";

const MAX_SOURCE_LENGTH = 200;

/** Same-site path the reader signed in from, or "/". */
export function normalizeLoginSource(source: unknown): string {
  if (typeof source !== "string") return "/";
  const trimmed = source.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  return trimmed.slice(0, MAX_SOURCE_LENGTH);
}

/**
 * Write one row to `login_tracking` — the same table the main site writes to.
 *
 * Only call this with a user that came from Supabase on the server (a fresh
 * `getUser()`, `exchangeCodeForSession` or `verifyOtp`), never with ids or
 * emails sent by the browser. IP and user agent are read from the request
 * headers here; callers cannot supply them.
 *
 * `supabase` should be the session client for that same user, so an RLS
 * policy of `auth.uid() = user_id` on the table holds.
 */
export async function recordLoginEvent(
  supabase: SupabaseClient,
  user: User,
  event: { method: LoginMethod; type: LoginType; source: unknown },
): Promise<void> {
  try {
    const headerList = await headers();
    // Best effort, for reporting only: the first X-Forwarded-For entry is
    // whatever the client or the nearest proxy put there.
    const ipAddress =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      null;
    const userAgent = headerList.get("user-agent")?.slice(0, 512) ?? null;

    const { error } = await supabase.from("login_tracking").insert({
      user_id: user.id,
      email: user.email ?? null,
      login_source: normalizeLoginSource(event.source),
      login_method: event.method,
      login_type: event.type,
      was_anonymous: false,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    if (error) console.error("[login tracking] insert failed:", error.message);
  } catch (error) {
    console.error("[login tracking] failed:", error);
  }
}
