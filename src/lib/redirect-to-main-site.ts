import { MERGED_POSTS } from "./merged-posts";

/**
 * blog.buildfastwithai.com is redirect-only.
 *
 * The blog moved back to the main site at www.buildfastwithai.com/blogs, in
 * the URL shapes it had before the Sep 2026 move to this subdomain. Every URL
 * that existed here 308s, in one hop, to the matching page there:
 *
 *   /                                → /blogs
 *   /<post>                          → /blogs/<post>
 *   /<merged-post>                   → /blogs/<keeper>        (merged-posts.ts)
 *   /<collection>[/page/N]           → /blogs/collection/<collection>[/page/N]
 *   /all[/page/N]                    → /blogs/all[/page/N]
 *   /author/<slug>[/page/N]          → /blogs/author/satvik-paramkusham[/page/N]
 *   /partnerships[/guidelines|/terms]→ /blogs/partnerships[...]
 *   /preview/<slug>                  → /blogs/preview/<slug>
 *   /feed.xml                        → /feed.xml
 *   /sitemap.xml, /llms.txt, …       → /blogs/sitemap.xml, /blogs/llms.txt, …
 *   images, favicons, /_next/image   → same path on www
 *   /auth/*, /api/*, /ingest/*       → same path on www
 *
 * Query strings are carried over. Only /robots.txt (crawlers must be able to
 * read it to follow the redirects) and /_next/* build assets are served here.
 *
 * Keep these redirects for at least 12 months after the move.
 */

const WWW = "https://www.buildfastwithai.com";
const BLOGS = `${WWW}/blogs`;

/**
 * Collections lived at /<slug> on this host (on www they are
 * /blogs/collection/<slug>). Snapshot of every collection that existed here,
 * taken from this host's llms.txt and sitemap on 2026-11-18. A collection
 * created after the move never had a URL here, so the list does not need to
 * grow. (An unlisted one still lands correctly: www/blogs/<slug> 308s a
 * collection slug to its collection page — just one extra hop.)
 */
export const LEGACY_COLLECTION_SLUGS = [
	"agentic-ai",
	"ai-agent-frameworks",
	"ai-applications-use-cases",
	"ai-automation",
	"ai-careers",
	"ai-coding-tools",
	"ai-image-video",
	"ai-industry-news-trends",
	"ai-prompts",
	"best-ai-models",
	"claude-ai",
	"data-application-development-ai",
	"gen-ai-libraries-frameworks",
	"google-gemini",
	"llm-concepts",
	"llmops-rag-evaluation",
	"mcp-protocols",
	"open-source-llms",
	"openai-chatgpt",
	"rag-vector-databases",
];

/** Files in public/ — the main site serves the same files at the same paths. */
const STATIC_FILE_PATHS = [
	"/authors/:path*",
	"/og/:path*",
	"/unrot/:path*",
	"/logo/:path*",
	"/favicon_package/:path*",
	"/icons/:path*",
	"/images/:path*",
	"/bg.webp",
	"/dark_logo.png",
	"/favicon.ico",
];

type Redirect = { source: string; destination: string; permanent: true };

const to = (source: string, destination: string): Redirect => ({
	source,
	destination,
	permanent: true,
});

/** Ordered: the first matching rule wins, so specific shapes come first. */
export function redirectsToMainSite(): Redirect[] {
	return [
		// Discovery files.
		to("/feed.xml", `${WWW}/feed.xml`),
		to("/sitemap.xml", `${BLOGS}/sitemap.xml`),
		to("/llms.txt", `${BLOGS}/llms.txt`),
		to("/llms-full.txt", `${BLOGS}/llms-full.txt`),
		to("/indexnow-key.txt", `${BLOGS}/indexnow-key.txt`),
		to("/opengraph-image", `${BLOGS}/og-image`),

		// Images and icons (shared links, hotlinked OG images, old HTML).
		...STATIC_FILE_PATHS.map((path) => to(path, `${WWW}${path}`)),
		to("/_next/image", `${WWW}/_next/image`),

		// Routes the main site serves at the same path. `(.*)` keeps a trailing
		// slash (PostHog posts to /ingest/e/), which `:path*` would not match.
		to("/auth/:path(.*)", `${WWW}/auth/:path`),
		to("/api/:path(.*)", `${WWW}/api/:path`),
		to("/ingest/:path(.*)", `${WWW}/ingest/:path`),

		// Merged posts go straight to their keeper (one hop, not two).
		...Object.entries(MERGED_POSTS).map(([from, keeper]) =>
			to(`/${from}`, `${BLOGS}/${keeper}`),
		),

		// Old main-site shapes typed onto this host by hand.
		to("/blogs/collection/:path*", `${BLOGS}/collection/:path*`),
		to("/blogs", BLOGS),
		to("/blogs/:path*", `${BLOGS}/:path*`),
		to("/collection/:path*", `${BLOGS}/collection/:path*`),

		// Collections lived at the root here.
		...LEGACY_COLLECTION_SLUGS.flatMap((slug) => [
			to(`/${slug}`, `${BLOGS}/collection/${slug}`),
			to(`/${slug}/page/:page`, `${BLOGS}/collection/${slug}/page/:page`),
		]),

		// The author slug's spelling changed (Paramkusam → Paramkusham).
		to(
			"/author/:alias(satvik-paramkusam|satvik)/:rest*",
			`${BLOGS}/author/satvik-paramkusham/:rest*`,
		),

		// Blog home.
		to("/", BLOGS),

		// Everything else keeps its path under /blogs: posts, /all,
		// /partnerships, /author, /preview. Not /_next (build assets) or
		// /robots.txt (crawlers need it to follow these redirects).
		to("/:path((?!_next/|robots\\.txt$).+)", `${BLOGS}/:path`),
	];
}
