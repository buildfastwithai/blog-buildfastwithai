import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Keeps the Supabase session fresh on every request (refreshes expiring
 * tokens and writes the new cookies back), exactly as the main site does.
 * Nothing here is route-protected — the blog is fully public; auth only
 * gates commenting.
 */
export async function proxy(request: NextRequest) {
  const { response } = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - image assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
