import type { MetadataRoute } from "next";
import { BLOG_SITE_URL } from "@/lib/urls";

// NEXT_PUBLIC_NOINDEX=true blocks crawling entirely — for preview / staging
// deployments, or production until the domain is ready to be indexed.
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_NOINDEX === "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /_next/ must stay crawlable: Googlebot needs its CSS/JS to render pages
      // and /_next/image to fetch the article images.
      disallow: ["/api/"],
    },
    sitemap: [`${BLOG_SITE_URL}/sitemap.xml`, `${BLOG_SITE_URL}/feed.xml`],
  };
}
