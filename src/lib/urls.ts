/**
 * The blog lives on its own subdomain (blog.buildfastwithai.com). Everything
 * that is *not* a blog page — programs, tools, workshops — still lives on the
 * main site, so links to those must be absolute or they 404 here.
 *
 * Blog-internal links (posts, collections, /all) stay relative.
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

// Blog URLs as they looked before the move to this subdomain, in every shape
// that shows up in article HTML: absolute on www / apex, absolute on this host
// with the old prefix kept, or relative.
const LEGACY_MAIN_SITE_BLOG_RE =
  /^https?:\/\/(?:www\.)?buildfastwithai\.com(?=\/blogs(?:[/?#]|$))/i;
const THIS_HOST_RE = /^https?:\/\/blog\.buildfastwithai\.com(?=[/?#]|$)/i;
const LEGACY_PREFIX_RE = /^\/blogs\/collection(?=[/?#]|$)|^\/blogs(?=[/?#]|$)|^\/collection(?=[/?#]|$)/i;

/**
 * Map a legacy blog link found in article HTML to its URL on this host.
 *
 * Post bodies are stored in Supabase and were written when the blog lived at
 * www.buildfastwithai.com/blogs. Left as-is, every such link is a cross-domain
 * 308 for readers and crawlers (a 2-hop chain for the apex-domain variant).
 * Rewriting at render time makes them direct until the stored HTML is fixed,
 * and keeps them direct if an editor pastes an old-style URL later.
 *
 *   https://www.buildfastwithai.com/blogs/some-post           -> /some-post
 *   https://buildfastwithai.com/blogs/collection/ai-news       -> /ai-news
 *   https://www.buildfastwithai.com/blogs/all/page/2           -> /all/page/2
 *   https://blog.buildfastwithai.com/blogs/some-post           -> /some-post
 *   /blogs/some-post, /collection/ai-news                      -> /some-post, /ai-news
 *
 * Anything else (main-site pages like /agentic-ai, external sites, anchors,
 * mailto:) is returned unchanged.
 */
export function normalizeLegacyBlogHref(href: string): string {
  const raw = href.trim();
  let path: string;

  if (LEGACY_MAIN_SITE_BLOG_RE.test(raw)) {
    path = raw.replace(LEGACY_MAIN_SITE_BLOG_RE, "");
  } else if (THIS_HOST_RE.test(raw)) {
    path = raw.replace(THIS_HOST_RE, "") || "/";
  } else if (raw.startsWith("/")) {
    path = raw;
  } else {
    return href;
  }

  if (!LEGACY_PREFIX_RE.test(path)) {
    // Already in the new shape (or a relative link that is not blog-related).
    return href;
  }

  const stripped = path.replace(LEGACY_PREFIX_RE, "");
  if (stripped === "" || stripped.startsWith("?") || stripped.startsWith("#")) {
    return `/${stripped}`;
  }
  return stripped;
}
