import type { NextRequest } from "next/server";

/**
 * Best-effort in-memory sliding-window rate limiter.
 *
 * Deliberately has no external dependency — no Redis, no Upstash, no extra
 * monthly bill. The trade-off is that state lives in a single serverless
 * instance's memory: it resets on cold start and is not shared across
 * concurrent instances, so a determined distributed attacker can exceed the
 * limit by fanning out.
 *
 * What it *does* reliably stop is the realistic case — one script hammering a
 * public endpoint — which is what turns an unauthenticated POST route into an
 * unbounded invocation bill. If you later need hard guarantees, swap the Map
 * for Upstash Redis; the call signature stays the same.
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

/** Best-guess client IP from proxy headers, falling back to a shared bucket. */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
