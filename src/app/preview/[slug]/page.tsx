import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  getPreviewBlogBySlug,
  getRelatedBlogsByCategory,
} from "@/actions/blog.actions";
import { BlogLayout } from "@/app/_components/blogspage/blog-layout";
import { verifyPreviewToken } from "@/lib/preview-token";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Review-only copy of an article: /preview/<slug>?token=<signed token>.
 *
 * Only posts with `is_preview = true` AND a valid, unexpired token for that
 * slug render here; anything else is a 404 — the same 404 whether the slug
 * exists or not, so slugs can't be probed. Mint a link with
 * `pnpm preview-link <slug> [days]` (see README → "Preview links").
 *
 * It uses the same BlogLayout as the public article page, so reviewers see
 * exactly what readers will. Deliberately left out compared to /[slug]: the
 * view tracker (reviewers are not readers), JSON-LD, and any canonical. It is
 * always rendered fresh (never cached) and marked noindex.
 */
export const dynamic = "force-dynamic";

type PreviewProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

async function authorizedSlug(props: PreviewProps): Promise<string | null> {
  const [{ slug }, { token }] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  return verifyPreviewToken(slug, typeof token === "string" ? token : null)
    ? slug
    : null;
}

const NOINDEX = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export async function generateMetadata(
  props: PreviewProps,
): Promise<Metadata> {
  const slug = await authorizedSlug(props);
  // No valid token: don't look the post up, and don't leak its title.
  const blog = slug ? await getPreviewBlogBySlug(slug) : null;

  return {
    title: blog?.title ? `Preview: ${blog.title}` : "Preview",
    robots: NOINDEX,
    // The root layout sets a canonical for the blog home; a preview must not
    // inherit it.
    alternates: { canonical: null },
  };
}

export default async function PreviewBlogPage(props: PreviewProps) {
  // Cap token guessing per client. In-memory, per instance (best effort).
  const limit = rateLimit({
    key: `preview:${getClientIp(await headers())}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!limit.ok) notFound();

  const slug = await authorizedSlug(props);
  if (!slug) notFound();

  const blog = await getPreviewBlogBySlug(slug);
  if (!blog) notFound();

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
        can see it, until the link expires.
      </div>
      <BlogLayout
        blog={{ ...blog, categories: blog.categories ?? [] }}
        relatedBlogs={relatedBlogs}
      />
    </main>
  );
}
