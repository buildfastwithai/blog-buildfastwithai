import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { blogUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

/** Most slugs one call may purge (and announce to IndexNow). */
const MAX_SLUGS = 50;

// A slug is one path segment: letters, digits and - _ . ~ only. Anything else
// (/, ?, #, %, ..) is rejected before it reaches revalidatePath().
const SLUG_RE = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,199}$/;

function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG_RE.test(value) && !value.includes("..");
}

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

/** Constant-time compare; hashing first makes both sides the same length. */
function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * The secret is accepted ONLY in the `x-revalidate-secret` header. It used to
 * be accepted as `?secret=` too, which leaks it into CloudFront/Lambda logs,
 * browser history and Referer headers.
 *
 * Returns a response to send when the request must stop, or null to go on.
 */
function guard(request: NextRequest): NextResponse | null {
  // Cap guessing and accidental loops. In-memory, per instance (best effort).
  const limit = rateLimit({
    key: `revalidate:${getClientIp(request.headers)}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const expected = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");
  if (!expected || !provided || !secretsMatch(provided, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return null;
}

function badSlugs(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

/** For curl and scripts: GET ?slug=&previousSlug= with the secret header. */
export async function GET(request: NextRequest) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return badSlugs("Missing slug");

  const previousSlug = request.nextUrl.searchParams.get("previousSlug");
  const slugs = [slug, previousSlug].filter((s): s is string => !!s);
  if (!slugs.every(isValidSlug)) return badSlugs("Invalid slug");

  revalidateBlog(slugs);
  // Only the live slug is worth announcing; a renamed-away slug now 404s.
  const indexNow = await notifySearchEngines([slug]);

  return NextResponse.json({ ok: true, revalidated: slugs, indexNow });
}

/** Scriptable: for a cron job or CI sweeper. */
export async function POST(request: NextRequest) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const raw: unknown[] = Array.isArray(body?.slugs)
    ? body.slugs
    : [body?.slug, body?.previousSlug];
  if (raw.length > MAX_SLUGS) {
    return badSlugs(`At most ${MAX_SLUGS} slugs per call`);
  }

  const slugs = raw.filter(
    (s): s is string => typeof s === "string" && s.length > 0
  );
  if (slugs.length === 0) return badSlugs("Missing slug");
  if (!slugs.every(isValidSlug)) return badSlugs("Invalid slug");

  revalidateBlog(slugs);
  const indexNow = await notifySearchEngines(slugs);
  return NextResponse.json({ ok: true, revalidated: slugs, indexNow });
}
