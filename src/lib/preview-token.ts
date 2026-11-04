import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed, expiring links for /preview/<slug>.
 *
 * Token format: `<expiresAtUnixSeconds>.<base64url HMAC-SHA256>`, signed over
 * `preview:<slug>:<expiresAt>` with PREVIEW_SECRET. A token only opens the
 * slug it was made for, stops working at its expiry, and cannot be forged
 * without the secret. scripts/preview-link.mjs makes the same tokens — keep
 * the two in step if the format ever changes.
 *
 * With no PREVIEW_SECRET (or one shorter than 32 characters) every token is
 * rejected, so a misconfigured deploy fails closed: previews 404.
 */

export const MAX_PREVIEW_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

function secret(): string | null {
  const value = process.env.PREVIEW_SECRET;
  return value && value.length >= 32 ? value : null;
}

function sign(key: string, slug: string, expiresAt: number): string {
  return createHmac("sha256", key)
    .update(`preview:${slug}:${expiresAt}`)
    .digest("base64url");
}

export function verifyPreviewToken(
  slug: string,
  token: unknown,
  nowMs: number = Date.now(),
): boolean {
  const key = secret();
  if (!key || typeof token !== "string" || token.length > 200) return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expPart = token.slice(0, dot);
  const sigPart = token.slice(dot + 1);
  if (!/^\d{1,12}$/.test(expPart) || !/^[A-Za-z0-9_-]{43}$/.test(sigPart)) {
    return false;
  }

  const expiresAt = Number(expPart);
  const now = Math.floor(nowMs / 1000);
  // Expired, or valid for longer than any link we would ever issue.
  if (expiresAt <= now || expiresAt > now + MAX_PREVIEW_TTL_SECONDS) {
    return false;
  }

  const expected = Buffer.from(sign(key, slug, expiresAt));
  const provided = Buffer.from(sigPart);
  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}
