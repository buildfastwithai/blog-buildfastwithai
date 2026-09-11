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
      disallow: ["/api/", "/_next/"],
    },
    sitemap: [`${BLOG_SITE_URL}/sitemap.xml`, `${BLOG_SITE_URL}/feed.xml`],
  };
}
