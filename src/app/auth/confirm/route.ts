import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
    console.error("Email confirm (token_hash) error:", error);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
    console.error("Email confirm (code) error:", error);
  }

  // redirect the user to an error page with some instructions
  redirect("/auth/auth-code-error");
}
