import { getStaticSupabaseClient } from "@/utils/supabase/static";
import { NextResponse } from "next/server";
import { BLOG_SITE_URL } from "@/lib/urls";

export const revalidate = 3600; // 1 hour

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#([0-9]+);/g, (_, dec) =>
      String.fromCharCode(parseInt(dec, 10))
    );
}

function htmlToMarkdown(html: string): string {
  if (!html) return "";

  let text = html;

  // Code blocks: <pre><code ...>code</code></pre>
  text = text.replace(
    /<pre[^>]*><code(?:\s+class=["'](?:language-)?([a-zA-Z0-9_-]+)["'])?[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_, lang, code) => {
      const cleanCode = decodeHtmlEntities(code.replace(/<[^>]+>/g, ""));
      const language = lang || "";
      return `\n\n\`\`\`${language}\n${cleanCode.trim()}\n\`\`\`\n\n`;
    }
  );

  // Standalone <pre>...</pre>
  text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
    const cleanCode = decodeHtmlEntities(code.replace(/<[^>]+>/g, ""));
    return `\n\n\`\`\`\n${cleanCode.trim()}\n\`\`\`\n\n`;
  });

  // Inline <code>...</code>
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, code) => {
    const cleanCode = decodeHtmlEntities(code.replace(/<[^>]+>/g, ""));
    return `\`${cleanCode.trim()}\``;
  });

  // Headings: <h1> to <h6>
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n");
  text = text.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n\n##### $1\n\n");
  text = text.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n\n###### $1\n\n");

  // Blockquotes
  text = text.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, quote) => {
    const cleanQuote = quote.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return `\n\n> ${decodeHtmlEntities(cleanQuote)}\n\n`;
  });

  // Links: <a href="...">...</a>
  text = text.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // Bold and Italic
  text = text.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
  text = text.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*");

  // Lists: <li> -> \n-
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1");
  text = text.replace(/<\/(?:ul|ol)>/gi, "\n\n");

  // Paragraphs and breaks
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/(?:p|div|section|article)>/gi, "\n\n");

  // Strip any remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode entities
  text = decodeHtmlEntities(text);

  // Normalize newlines and whitespace
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Standard /llms-full.txt endpoint containing complete articles in Markdown format
 * for deep LLM context injection and semantic search pipelines.
 */
export async function GET() {
  try {
    const supabase = getStaticSupabaseClient();

    const { data: blogs, error } = await supabase
      .from("blogs")
      .select(`
        id,
        title,
        excerpt,
        content,
        slug,
        created_at,
        categories:blogs_category_join(
          category:blogs_category(id, name)
        )
      `)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blogs for llms-full.txt:", error);
      return new NextResponse("Error generating llms-full.txt", { status: 500 });
    }

    const sections: string[] = [
      "# Build Fast with AI Blog - Full Content Feed",
      "",
      "> Comprehensive developer tutorials, model benchmarks, and AI engineering guides from Build Fast with AI Blog, structured for LLM ingestion, semantic search, and context augmentation.",
      "",
      "---",
      "",
    ];

    for (const blog of blogs ?? []) {
      const blogUrl = `${BLOG_SITE_URL}/${blog.slug}`;
      const cats = Array.isArray(blog.categories)
        ? (blog.categories as any[])
            .map((c) => c.category?.name)
            .filter(Boolean)
            .join(", ")
        : "";

      const bodyMarkdown = htmlToMarkdown(blog.content || blog.excerpt || "");

      sections.push(
        `# ${blog.title || "Untitled"}\n` +
          `- **URL**: ${blogUrl}\n` +
          `- **Published**: ${blog.created_at || "Unknown"}\n` +
          (cats ? `- **Categories**: ${cats}\n` : "") +
          (blog.excerpt ? `- **Summary**: ${blog.excerpt.trim()}\n` : "") +
          "\n" +
          bodyMarkdown +
          "\n\n---\n"
      );
    }

    const content = sections.join("\n");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating llms-full.txt:", error);
    return new NextResponse("Error generating llms-full.txt", { status: 500 });
  }
}
