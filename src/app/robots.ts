import type { MetadataRoute } from "next";

/**
 * The only route this redirect-only host still serves (see
 * src/lib/redirect-to-main-site.ts).
 *
 * Production allows everything: Google must be able to fetch the old URLs to
 * see their 308s and move each page's signals to www.buildfastwithai.com/blogs.
 * A Disallow here would freeze the old URLs in the index instead.
 *
 * NEXT_PUBLIC_NOINDEX=true (non-production stages) still blocks crawling.
 */
export default function robots(): MetadataRoute.Robots {
	if (process.env.NEXT_PUBLIC_NOINDEX === "true") {
		return { rules: { userAgent: "*", disallow: "/" } };
	}

	return {
		rules: { userAgent: "*", allow: "/" },
		sitemap: "https://www.buildfastwithai.com/blogs/sitemap.xml",
	};
}
