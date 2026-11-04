import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { recordLoginEvent } from "@/lib/login-tracking";
import { redirectOrigin, safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/utils/supabase/server";

/**
 * OAuth (Google) callback. Supabase redirects here with a one-time `code`;
 * exchanging it sets the session cookies on *this* domain.
 *
 * Same flow as the main site minus its anonymous-session data transfers —
 * the blog never creates anonymous sessions, so there is nothing to move.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  // Never built from X-Forwarded-Host as-is: see redirectOrigin.
  const origin = redirectOrigin(request);

  const cookieStore = await cookies();

  // Where to send the reader afterwards: the page they clicked "Continue with
  // Google" on. The login form stores it in a cookie; a `next` query param is
  // still honoured for links that carry one. Both are untrusted, so only a
  // same-site path survives (see safeNextPath).
  const rawLoginSource = cookieStore.get("login_source")?.value;
  let loginSource = "/";
  if (rawLoginSource) {
    try {
      loginSource = safeNextPath(decodeURIComponent(rawLoginSource));
    } catch {
      loginSource = "/";
    }
  }

  const next = safeNextPath(searchParams.get("next"), loginSource);

  if (code) {
    const supabase = await createClient();

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // The user comes from the code exchange, not from the request. Awaited:
      // on Lambda, work left running after the response is sent can be
      // frozen and lost. recordLoginEvent never throws.
      if (data.user) {
        await recordLoginEvent(supabase, data.user, {
          method: "google",
          type: "sign_in",
          source: loginSource,
        });
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.delete("login_source");
      return response;
    }
    console.error("Auth callback error:", error);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
