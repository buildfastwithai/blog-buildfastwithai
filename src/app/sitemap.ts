import type { MetadataRoute } from "next";
import { BLOGS_PAGE_SIZE } from "@/actions/blog.actions";
import { BLOG_SITE_URL } from "@/lib/urls";
import { getStaticSupabaseClient } from "@/utils/supabase/static";

/** Recency-based priority: fresh posts are the ones worth crawling first. */
function calculateBlogPriority(
  createdAt: string,
  isFounderCorner: boolean,
): number {
  let priority = 0.5;
  if (isFounderCorner) priority += 0.15;

  const daysSinceCreation =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 30) priority += 0.15;
  else if (daysSinceCreation < 90) priority += 0.1;

  return Math.min(1.0, priority);
}

// Also revalidated on demand by /api/revalidate/blog.
export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getStaticSupabaseClient();

  const [{ data: blogs }, { data: curatedCollections }] = await Promise.all([
    supabase
      .from("blogs")
      .select("slug, image_url, created_at, is_founder_corner, published")
      .eq("published", true),
    supabase
      .from("blogs_curated")
      .select("id, name, slug, blogs:blogs_curated_join(count)"),
  ]);

  const blogList =
    blogs?.map((item) => ({
      url: `${BLOG_SITE_URL}/${item.slug}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: calculateBlogPriority(
        item.created_at || new Date().toISOString(),
        item.is_founder_corner || false,
      ),
      images: item.image_url ? [item.image_url] : undefined,
    })) ?? [];

  const totalArchivePages = Math.ceil((blogs?.length ?? 0) / BLOGS_PAGE_SIZE);
  const archivePages = Array.from(
    { length: Math.max(0, totalArchivePages - 1) },
    (_, i) => ({
      url: `${BLOG_SITE_URL}/all/page/${i + 2}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }),
  );

  const collectionList =
    curatedCollections?.flatMap((collection) => {
      const base = `${BLOG_SITE_URL}/collection/${collection.slug || collection.id}`;
      const articleCount = (collection.blogs as any)?.[0]?.count ?? 0;
      const totalPages = Math.ceil(articleCount / BLOGS_PAGE_SIZE);

      return [
        {
          url: base,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
        // Paginated collection pages — how crawlers reach articles beyond the
        // first page of a collection.
        ...Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
          url: `${base}/page/${i + 2}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.5,
        })),
      ];
    }) ?? [];

  return [
    {
      url: BLOG_SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BLOG_SITE_URL}/all`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...blogList,
    ...archivePages,
    ...collectionList,
  ];
}
