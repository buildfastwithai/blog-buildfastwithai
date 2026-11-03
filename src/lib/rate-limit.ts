/**
 * BEST-EFFORT in-memory fixed-window rate limiter. Not a hard guarantee.
 *
 * State lives in one Lambda instance's memory, so:
 *  - it resets on every cold start;
 *  - it is NOT shared between concurrent instances — a burst that fans out
 *    across N instances gets up to N × limit through;
 *  - once MAX_TRACKED_KEYS live keys exist, the oldest is evicted, so an
 *    attacker with many IPs can push their own counter out.
 *
 * It does stop the common case (one client looping on an endpoint from one
 * warm instance). For real protection on public write endpoints, put AWS WAF
 * rate-based rules on the CloudFront distribution, or swap the Map for a
 * shared store (Upstash Redis / DynamoDB) — the call signature can stay.
 */
type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

// Bound the map so a spray of unique IPs can't grow it without limit.
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      // Cheap eviction: drop everything already expired, then the oldest key.
      for (const [k, v] of buckets) {
        if (v.resetAt <= now) buckets.delete(k);
      }
      if (buckets.size >= MAX_TRACKED_KEYS) {
        const oldest = buckets.keys().next().value;
        if (oldest) buckets.delete(oldest);
      }
    }

    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return {
    ok: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

type HeaderSource = { get(name: string): string | null };

/**
 * Client IP for rate limiting, from headers a client cannot forge when the
 * request comes through CloudFront.
 *
 * 1. `CloudFront-Viewer-Address` ("ip:port") — set by CloudFront from the TCP
 *    connection and forwarded by SST's origin request policy
 *    (AllViewerExceptHostHeader includes the viewer location headers).
 * 2. The LAST `X-Forwarded-For` entry — CloudFront appends the address it saw,
 *    whereas the first entry is whatever the client sent.
 *
 * Both assume the server is only reachable through CloudFront. If its Lambda
 * function URL can be called directly, these headers are caller-controlled.
 *
 * Accepts `request.headers` or the result of `await headers()`.
 */
export function getClientIp(source: HeaderSource): string {
  const viewer = source.get("cloudfront-viewer-address")?.trim();
  if (viewer) {
    // IPv4 "203.0.113.7:46532", IPv6 "2001:db8::1:46532": the port follows
    // the last colon.
    const cut = viewer.lastIndexOf(":");
    const ip = cut > 0 ? viewer.slice(0, cut) : viewer;
    if (ip) return ip.replace(/^\[|\]$/g, "");
  }

  const forwarded = source.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    const last = hops[hops.length - 1];
    if (last) return last;
  }

  return source.get("x-real-ip")?.trim() || "unknown";
}
