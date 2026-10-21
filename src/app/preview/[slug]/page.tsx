import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPreviewBlogBySlug,
  getRelatedBlogsByCategory,
} from "@/actions/blog.actions";
import { BlogLayout } from "@/app/_components/blogspage/blog-layout";

/**
 * Review-only copy of an article: /preview/<slug>.
 *
 * Only posts with `is_preview = true` render here; anything else is a 404. It
 * uses the same BlogLayout as the public article page, so reviewers see exactly
 * what readers will.
 *
 * Deliberately left out compared to /[slug]: the view tracker (reviewers are not
 * readers), JSON-LD, and any canonical. It is always rendered fresh (never
 * cached) and marked noindex so search engines never pick it up.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const blog = await getPreviewBlogBySlug(slug);

  return {
    title: blog?.title ? `Preview: ${blog.title}` : "Preview",
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    // The root layout sets a canonical for the blog home; a preview must not
    // inherit it.
    alternates: { canonical: null },
  };
}

export default async function PreviewBlogPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const blog = await getPreviewBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const categoryIds =
    blog.categories?.map((cat: { id: number }) => cat.id) ?? [];
  const relatedBlogs =
    categoryIds.length > 0
      ? await getRelatedBlogsByCategory(categoryIds, blog.id, 6)
      : [];

  return (
    <main className="bg-background min-h-screen">
      <div className="bg-amber-100 text-amber-900 border-b border-amber-300 px-4 py-2 text-center text-sm font-medium">
        Preview &mdash; this article is not published. Only people with this link
        can see it.
      </div>
      <BlogLayout
        blog={{ ...blog, categories: blog.categories ?? [] }}
        relatedBlogs={relatedBlogs}
      />
    </main>
  );
}
