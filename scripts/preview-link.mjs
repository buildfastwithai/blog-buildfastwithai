#!/usr/bin/env node
/**
 * Print a signed, expiring /preview link for one article.
 *
 *   PREVIEW_SECRET=... pnpm preview-link <slug> [days=7] [site=https://blog.buildfastwithai.com]
 *
 * The post must also have `is_preview = true`. Links last 1-30 days. Uses the
 * same token format as src/lib/preview-token.ts — keep the two in step.
 * PREVIEW_SECRET must match the deployed stage's value (32+ characters).
 */
import { createHmac } from "node:crypto";

const [slug, daysArg = "7", siteArg] = process.argv.slice(2);
const secret = process.env.PREVIEW_SECRET;
const site = (
  siteArg ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://blog.buildfastwithai.com"
).replace(/\/$/, "");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!slug || !/^[A-Za-z0-9][A-Za-z0-9._~-]{0,199}$/.test(slug)) {
  fail("Usage: pnpm preview-link <slug> [days=7] [site-url]");
}
if (!secret || secret.length < 32) {
  fail("Set PREVIEW_SECRET (32+ characters, same value as the deployed stage).");
}
const days = Number(daysArg);
if (!Number.isInteger(days) || days < 1 || days > 30) {
  fail("days must be a whole number from 1 to 30.");
}

const expiresAt = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
const signature = createHmac("sha256", secret)
  .update(`preview:${slug}:${expiresAt}`)
  .digest("base64url");

console.log(
  `${site}/preview/${slug}?token=${expiresAt}.${signature}`,
);
console.error(`Expires ${new Date(expiresAt * 1000).toISOString()}`);
