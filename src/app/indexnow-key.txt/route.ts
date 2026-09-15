import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * IndexNow key file. Search engines fetch this once to verify that whoever
 * submits URLs for blog.buildfastwithai.com controls the host. Referenced as
 * `keyLocation` in src/lib/indexnow.ts. 404s when IndexNow is not configured.
 */
export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
