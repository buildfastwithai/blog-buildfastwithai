/**
 * Helpers for post-login redirects, so `?next=` and the `login_source` cookie
 * can only ever send someone to a page on this site.
 */

const PLACEHOLDER_ORIGIN = "https://blog.invalid";

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/**
 * Same-site path (pathname + search + hash) from an untrusted value, or
 * `fallback`.
 *
 * Rejected:
 *  - anything not starting with a single "/" (absolute URLs, `//evil.com`);
 *  - backslashes (browsers read `/\evil.com` as `//evil.com`);
 *  - tabs, newlines and other control characters (stripped by URL parsers,
 *    so `/<tab>/evil.com` would also become `//evil.com`);
 *  - anything that resolves off-site or to a path starting with `//`
 *    (e.g. `/.//evil.com`, which normalises to `//evil.com`).
 */
export function safeNextPath(raw: unknown, fallback = "/"): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2048) {
    return fallback;
  }
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return fallback;
  }
  if (hasControlChars(raw)) return fallback;

  try {
    const url = new URL(raw, PLACEHOLDER_ORIGIN);
    if (url.origin !== PLACEHOLDER_ORIGIN) return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (!path.startsWith("/") || path.startsWith("//")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}

/**
 * Origin to build absolute redirects on, without trusting X-Forwarded-Host
 * blindly.
 *
 * - Local dev: the request's own origin.
 * - Deployed with NEXT_PUBLIC_SITE_URL (always set on production): that.
 * - Otherwise (staging on its *.cloudfront.net URL): the forwarded host, but
 *   only when it is a CloudFront hostname. SST's CloudFront function sets
 *   x-forwarded-host from the viewer's Host, which CloudFront only accepts for
 *   this distribution.
 * - Anything else: the request's own origin.
 */
export function redirectOrigin(request: Request): string {
  const own = new URL(request.url).origin;
  if (process.env.NODE_ENV === "development") return own;

  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // fall through
    }
  }

  const forwarded = request.headers.get("x-forwarded-host")?.trim().toLowerCase();
  if (forwarded && /^[a-z0-9]+\.cloudfront\.net$/.test(forwarded)) {
    return `https://${forwarded}`;
  }
  return own;
}
