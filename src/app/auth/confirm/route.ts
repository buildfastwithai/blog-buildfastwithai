import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  type LoginMethod,
  type LoginType,
  recordLoginEvent,
} from "@/lib/login-tracking";
import { createClient } from "@/utils/supabase/server";

/**
 * Which login_tracking row a confirmed link stands for. The blog's login form
 * only sends sign-up confirmations here, so a PKCE `code` (which carries no
 * type) counts as a sign-up. Recovery, invite and email-change links are not
 * logins and are not recorded.
 */
function trackedEvent(
  type: EmailOtpType | null,
): { method: LoginMethod; type: LoginType } | null {
  if (type === null || type === "signup" || type === "email") {
    return { method: "email_password", type: "sign_up" };
  }
  if (type === "magiclink") return { method: "email_link", type: "sign_in" };
  return null;
}

/**
 * Email confirmation / magic-link landing.
 *
 * Handles both link formats Supabase can send, so this works regardless of how
 * the project's email templates are configured:
 *  - `token_hash` + `type`  — template built on {{ .TokenHash }}
 *  - `code`                 — template built on {{ .ConfirmationURL }} (PKCE)
 *
 * Either way the session cookies are set on this domain and the user lands on
 * the page they signed up from.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) next = "/";

  const supabase = await createClient();

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      const event = trackedEvent(type);
      if (data.user && event) {
        await recordLoginEvent(supabase, data.user, { ...event, source: next });
      }
      redirect(next);
    }
    console.error("Email confirm (token_hash) error:", error);
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const event = trackedEvent(null);
      if (data.user && event) {
        await recordLoginEvent(supabase, data.user, { ...event, source: next });
      }
      redirect(next);
    }
    console.error("Email confirm (code) error:", error);
  }

  // redirect the user to an error page with some instructions
  redirect("/auth/auth-code-error");
}
