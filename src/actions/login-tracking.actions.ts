"use server";

import { type LoginType, recordLoginEvent } from "@/lib/login-tracking";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/utils/supabase/server";

const LOGIN_TYPES: readonly LoginType[] = ["sign_in", "sign_up"];

/**
 * Record an email/password sign-in (or a sign-up that returned a session) from
 * the login form.
 *
 * This is a public endpoint ("use server" + client import), so it trusts
 * nothing from the caller except two labels: who signed in comes from the
 * verified session, IP and user agent come from the request headers, and the
 * method is fixed. Google sign-ins and confirmed email sign-ups are recorded
 * by the /auth routes on the server instead.
 */
export async function trackPasswordLogin(input: {
  login_type: LoginType;
  login_source: string;
}): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) return { success: false };

  const type = LOGIN_TYPES.includes(input?.login_type)
    ? input.login_type
    : "sign_in";

  // A real login fires this once; anything more is a loop or a script.
  // In-memory and per instance, so best effort (see rate-limit.ts).
  const limited = !rateLimit({
    key: `login-tracking:${user.id}`,
    limit: 5,
    windowMs: 60_000,
  }).ok;
  if (limited) return { success: false };

  await recordLoginEvent(supabase, user, {
    method: "email_password",
    type,
    source: input?.login_source,
  });

  return { success: true };
}
