import { getStaticSupabaseClient } from "@/utils/supabase/static";
import { NextResponse } from "next/server";
import { BLOG_SITE_URL, MAIN_SITE_URL } from "@/lib/urls";

export const revalidate = 3600; // 1 hour

/**
 * Standard /llms.txt endpoint for LLM and AI agent discovery.
 * Specification: https://llmstxt.org/
 */
export async function GET() {
  try {
    const supabase = getStaticSupabaseClient();

    const [{ data: blogs, error: blogsError }, { data: collections, error: collectionsError }] =
      await Promise.all([
        supabase
          .from("blogs")
          .select("slug, title, excerpt, created_at")
          .eq("published", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("blogs_curated")
          .select("id, name, slug, description")
          .order("name", { ascending: true }),
      ]);

    if (blogsError) {
      console.error("Error fetching blogs for llms.txt:", blogsError);
    }
    if (collectionsError) {
      console.error("Error fetching collections for llms.txt:", collectionsError);
    }

    const lines: string[] = [
      "# Build Fast with AI Blog",
      "",
      "> Build Fast with AI Blog provides the latest artificial intelligence tutorials, AI agent frameworks, LLM guides, model releases, and code snippets to help developers build faster with AI.",
      "",
      "## Main Links",
      `- [Full Content Feed](${BLOG_SITE_URL}/llms-full.txt): Complete text of all published articles for context injection and LLM processing`,
      `- [Blog Home](${BLOG_SITE_URL}): Latest AI articles and tutorials`,
      `- [All Articles Archive](${BLOG_SITE_URL}/all): Complete browsable archive of all posts`,
      `- [Main Website](${MAIN_SITE_URL}): Build Fast with AI homepage`,
      `- [Free AI Workshops](${MAIN_SITE_URL}/ai-workshops): Live interactive AI engineering sessions and workshops`,
      `- [Agentic AI Launchpad](${MAIN_SITE_URL}/agentic-ai): Production-focused cohort program to build AI agents`,
      `- [RSS Feed](${BLOG_SITE_URL}/feed.xml): RSS 2.0 feed for blog updates`,
      `- [Sitemap](${BLOG_SITE_URL}/sitemap.xml): Machine-readable XML sitemap`,
      "",
    ];

    if (collections && collections.length > 0) {
      lines.push("## Curated Collections");
      lines.push("");
      for (const col of collections) {
        const colUrl = `${BLOG_SITE_URL}/${col.slug || col.id}`;
        const desc = col.description ? `: ${col.description.replace(/\s+/g, " ").trim()}` : "";
        lines.push(`- [${col.name}](${colUrl})${desc}`);
      }
      lines.push("");
    }

    if (blogs && blogs.length > 0) {
      lines.push("## Articles & Guides");
      lines.push("");
      for (const blog of blogs) {
        const blogUrl = `${BLOG_SITE_URL}/${blog.slug}`;
        const excerpt = blog.excerpt
          ? `: ${blog.excerpt.replace(/\s+/g, " ").trim()}`
          : "";
        lines.push(`- [${blog.title || "Untitled"}](${blogUrl})${excerpt}`);
      }
      lines.push("");
    }

    const content = lines.join("\n");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating llms.txt:", error);
    return new NextResponse("Error generating llms.txt", { status: 500 });
  }
}
