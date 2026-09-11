/**
 * The blog lives on its own subdomain (blog.buildfastwithai.com). Everything
 * that is *not* a blog page — programs, tools, workshops — still lives on the
 * main site, so links to those must be absolute or they 404 here.
 *
 * Blog-internal links (posts, /all, /collection/*) stay relative.
 */
export const MAIN_SITE_URL = "https://www.buildfastwithai.com";

export const BLOG_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://blog.buildfastwithai.com";

/** Absolute URL for a path on the main marketing site. */
export function mainSiteUrl(path: string): string {
  return `${MAIN_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Absolute URL for a path on this blog site (used for canonicals / JSON-LD). */
export function blogUrl(path = "/"): string {
  return `${BLOG_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
