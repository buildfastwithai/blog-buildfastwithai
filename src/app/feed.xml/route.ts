import { getStaticSupabaseClient } from "@/utils/supabase/static";
import { NextResponse } from "next/server";
import { BLOG_SITE_URL, MAIN_SITE_URL } from "@/lib/urls";

const BASE_URL = BLOG_SITE_URL;

// Same fix as sitemap.ts: the cookie-based client forced this route dynamic, so
// the s-maxage header below only ever helped at the CDN and every origin miss
// re-queried 50 full article bodies. Blog data here is public and sessionless.
export const revalidate = 3600; // 1 hour

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate RSS feed for blog posts
 */
export async function GET() {
  try {
    const supabase = getStaticSupabaseClient();

    // Summary feed, not full-text. This used to select `content` for 50 posts
    // and inline all of it in <content:encoded>, producing a ~1.6 MB document
    // that was re-queried and re-serialised on every refresh. Readers now get
    // the excerpt plus a link to the article.
    const { data: blogs, error } = await supabase
      .from("blogs")
      .select("slug, title, excerpt, image_url, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      console.error("Error fetching blogs for RSS:", error);
      return new NextResponse("Error generating feed", { status: 500 });
    }

    // Build RSS feed XML
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Build Fast with AI Blog</title>
    <link>${BASE_URL}</link>
    <description>Latest AI/ML development tutorials, guides, and insights to help you build fast with artificial intelligence.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/opengraph-image.png</url>
      <title>Build Fast with AI</title>
      <link>${MAIN_SITE_URL}</link>
    </image>
    ${blogs
      ?.map((blog) => {
        const blogUrl = `${BASE_URL}/${blog.slug}`;
        const pubDate = blog.created_at
          ? new Date(blog.created_at).toUTCString()
          : new Date().toUTCString();
        const description = escapeXml(
          blog.excerpt || blog.title || "Read the full article"
        );

        return `
    <item>
      <title>${escapeXml(blog.title || "Untitled")}</title>
      <link>${blogUrl}</link>
      <guid isPermaLink="true">${blogUrl}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      ${blog.image_url ? `<enclosure url="${blog.image_url}" type="image/jpeg"/>` : ""}
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

    return new NextResponse(feed, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}

