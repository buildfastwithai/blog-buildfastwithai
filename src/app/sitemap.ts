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
      .select("slug, image_url, extra_image_urls, created_at, is_founder_corner, published")
      .eq("published", true),
    supabase
      .from("blogs_curated")
      .select("id, name, slug, blogs:blogs_curated_join(count)"),
  ]);

  const blogList =
    blogs?.map((item) => {
      const images: string[] = [];
      if (item.image_url) images.push(item.image_url);
      if (Array.isArray((item as any).extra_image_urls)) {
        images.push(...(item as any).extra_image_urls.filter(Boolean));
      }

      return {
        url: `${BLOG_SITE_URL}/${item.slug}`,
        lastModified: item.created_at ? new Date(item.created_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: calculateBlogPriority(
          item.created_at || new Date().toISOString(),
          item.is_founder_corner || false,
        ),
        images: images.length > 0 ? images : undefined,
      };
    }) ?? [];

  // The blogs table has no updated_at column, so created_at is the best "last
  // changed" signal. Listing pages change when a new post is published, so they
  // use the newest post's date. A lastmod of "now" on every build teaches Google
  // to ignore the field. Pages with no reliable date omit lastModified.
  const latestPostDate = (blogs ?? []).reduce<Date | undefined>((latest, item) => {
    if (!item.created_at) return latest;
    const date = new Date(item.created_at);
    return !latest || date > latest ? date : latest;
  }, undefined);

  const totalArchivePages = Math.ceil((blogs?.length ?? 0) / BLOGS_PAGE_SIZE);
  const archivePages = Array.from(
    { length: Math.max(0, totalArchivePages - 1) },
    (_, i) => ({
      url: `${BLOG_SITE_URL}/all/page/${i + 2}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }),
  );

  const collectionList =
    curatedCollections?.flatMap((collection) => {
      const base = `${BLOG_SITE_URL}/${collection.slug || collection.id}`;
      const articleCount = (collection.blogs as any)?.[0]?.count ?? 0;
      const totalPages = Math.ceil(articleCount / BLOGS_PAGE_SIZE);

      return [
        {
          url: base,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
        // Paginated collection pages — how crawlers reach articles beyond the
        // first page of a collection.
        ...Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
          url: `${base}/page/${i + 2}`,
          changeFrequency: "weekly" as const,
          priority: 0.5,
        })),
      ];
    }) ?? [];

  // Profile page only. Its pagination is noindex: with one author it is the
  // same list as /all/page/N, which is already listed below.
  const authorPages = [
    {
      url: `${BLOG_SITE_URL}/author/satvik-paramkusam`,
      lastModified: latestPostDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  const partnershipPages = [
    { path: "/partnerships", priority: 0.6 },
    { path: "/partnerships/guidelines", priority: 0.4 },
    { path: "/partnerships/terms", priority: 0.3 },
  ].map(({ path, priority }) => ({
    url: `${BLOG_SITE_URL}${path}`,
    lastModified: new Date("2026-10-15"),
    changeFrequency: "monthly" as const,
    priority,
  }));

  return [
    {
      url: BLOG_SITE_URL,
      lastModified: latestPostDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BLOG_SITE_URL}/all`,
      lastModified: latestPostDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...authorPages,
    ...partnershipPages,
    ...blogList,
    ...archivePages,
    ...collectionList,
  ];
}
