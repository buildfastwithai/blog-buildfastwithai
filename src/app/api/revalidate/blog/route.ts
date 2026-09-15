import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";
import { blogUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

/**
 * On-demand cache purge for blog content.
 *
 * Blog posts are authored outside this codebase (nothing in `src/` writes blog
 * content), so there is no server action to hang a revalidatePath() call off.
 * This endpoint is the manual equivalent: publish or edit a post, call it, and
 * the change is live in seconds instead of waiting out the page's revalidate
 * timer.
 *
 * Nothing here is load-bearing. If it is never called, content is still correct
 * within 24h via the `revalidate` on each page.
 */
function revalidateBlog(slugs: string[]) {
  // The changed article(s). Pass previousSlug on a rename so the old URL's
  // cached entry is dropped too, instead of serving a stale copy until its
  // safety-net revalidate expires.
  for (const slug of slugs) {
    revalidatePath(`/${slug}`);
  }

  // Surfaces that embed article cards.
  revalidatePath("/");
  revalidatePath("/all");
  revalidatePath("/all/page/[page]", "page");
  // Collections share the /[slug] route with articles.
  revalidatePath("/[slug]", "page");
  revalidatePath("/[slug]/page/[page]", "page");

  // Discovery surfaces.
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");
}

/**
 * After the cache is purged, tell IndexNow-enabled engines which article URLs
 * changed so they recrawl now rather than on their own schedule. Best effort:
 * a failure here never fails the revalidation itself.
 */
async function notifySearchEngines(slugs: string[]) {
  return submitToIndexNow(slugs.map((slug) => blogUrl(`/${slug}`)));
}

function authorize(request: NextRequest): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return false;
  const provided =
    request.headers.get("x-revalidate-secret") ??
    request.nextUrl.searchParams.get("secret");
  return provided === expected;
}

/** Browser-friendly: paste a URL after publishing. */
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "Missing slug" },
      { status: 400 }
    );
  }

  const previousSlug = request.nextUrl.searchParams.get("previousSlug");
  const slugs = [slug, previousSlug].filter((s): s is string => !!s);
  revalidateBlog(slugs);
  // Only the live slug is worth announcing; a renamed-away slug now 404s.
  const indexNow = await notifySearchEngines([slug]);

  return NextResponse.json({ ok: true, revalidated: slugs, indexNow });
}

/** Scriptable: for a cron job or CI sweeper. */
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slugs = (
    Array.isArray(body?.slugs) ? body.slugs : [body?.slug, body?.previousSlug]
  ).filter((s: unknown): s is string => typeof s === "string" && s.length > 0);

  if (slugs.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Missing slug" },
      { status: 400 }
    );
  }

  revalidateBlog(slugs);
  const indexNow = await notifySearchEngines(slugs);
  return NextResponse.json({ ok: true, revalidated: slugs, indexNow });
}
