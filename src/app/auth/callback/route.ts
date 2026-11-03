import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { recordLoginEvent } from "@/lib/login-tracking";
import { createClient } from "@/utils/supabase/server";

/**
 * OAuth (Google) callback. Supabase redirects here with a one-time `code`;
 * exchanging it sets the session cookies on *this* domain.
 *
 * Same flow as the main site minus its anonymous-session data transfers —
 * the blog never creates anonymous sessions, so there is nothing to move.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const cookieStore = await cookies();

  // Where to send the reader afterwards: the page they clicked "Continue with
  // Google" on. The login form stores it in a cookie; a `next` query param is
  // still honoured for links that carry one. Only same-site paths are allowed.
  const rawLoginSource = cookieStore.get("login_source")?.value;
  let loginSource = "/";
  if (rawLoginSource) {
    try {
      loginSource = decodeURIComponent(rawLoginSource);
    } catch {
      loginSource = rawLoginSource;
    }
  }

  let next = searchParams.get("next") ?? loginSource;
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/";
  }

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

      const response = (() => {
        const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === "development";
        if (isLocalEnv) {
          // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      })();

      response.cookies.delete("login_source");
      return response;
    } else {
      console.error("Auth callback error:", error);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
