import { cache } from "react";
import { getStaticSupabaseClient } from "@/utils/supabase/static";

/**
 * Columns needed to render a blog *card* (grid tile, related item, listing entry).
 *
 * Deliberately excludes `content` — the full article HTML. Selecting `*` in list
 * queries embedded up to ~10 article bodies into every blog page's ISR entry and
 * RSC payload, and ISR reads/writes are billed per 8 KB chunk. Only getBlogBySlug
 * should ever select `content`.
 *
 * If you add a field to a card component, add it here too or it arrives undefined.
 */
const BLOG_CARD_FIELDS = `
  id,
  title,
  excerpt,
  slug,
  image_url,
  created_at,
  categories:blogs_category_join(
    category:blogs_category(id, name)
  )
`;

/** How many cards a listing page shows. */
export const BLOGS_PAGE_SIZE = 24;

/**
 * PostgREST builds `.or()` from a comma-separated filter string, so an
 * unescaped comma or paren in user input escapes the intended filter. Strip the
 * grammar characters and cap the length rather than interpolating raw input.
 */
function sanitizeSearchTerm(query: string): string {
  return query
    .replace(/[,()\\"']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/**
 * The card-shaped subset of a blog row — exactly what BLOG_CARD_FIELDS selects.
 * Every listing query returns this. Components that render cards should type
 * their props as BlogCardData, not Blog, so that adding a `content` read to a
 * card is a type error rather than a silent `undefined`.
 */
export interface BlogCardData {
  id: number;
  title: string | null;
  excerpt: string | null;
  slug: string | null;
  image_url: string | null;
  created_at: string;
  categories?: BlogCategory[];
}

/** A full blog row. Only getBlogBySlug returns this. */
export interface Blog extends BlogCardData {
  content: string | null;
  image_path: string | null;
  published: boolean | null;
  views: number | null;
  is_founder_corner: boolean | null;
  extra_image_urls: string[] | null;
  meta_keywords?: string | null;
  author_name?: string | null;
  author_url?: string | null;
}

export interface BlogCategory {
  id: number;
  name: string;
}

/**
 * The card-shaped subset of a curated collection — what CURATED_CARD_FIELDS
 * selects. Enough to render a link tile (cover image, title, slug, count) and
 * nothing else. Excludes extended_content and faqs, which are long-form HTML
 * only the collection page itself renders.
 */
export interface BlogCuratedMeta {
  id: number;
  name: string;
  slug: string | null;
  image_url: string | null;
  articles_count?: number;
}

/** A full curated collection row. */
export interface BlogCurated extends BlogCuratedMeta {
  description: string | null;
  heading: string | null;
  meta_title: string | null;
  meta_description: string | null;
  extended_content: string | null;
  faqs: any[] | null;
}

// (BlogWithCategories / BlogWithCurated were removed — zero references.)

export interface BlogsPage {
  blogs: BlogCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * One page of published blogs, optionally filtered by category or search term.
 *
 * Replaces the old getPublishedBlogs(), which returned *every* published row and
 * handed the whole array to a client component. Filtering and paging happen in
 * Postgres now, so a listing page ships ~24 cards instead of ~460 — and the
 * database returns 24 rows instead of scanning everything on each regeneration.
 */
export async function getPublishedBlogsPage({
  page = 1,
  pageSize = BLOGS_PAGE_SIZE,
  categoryId = null,
  query = "",
}: {
  page?: number;
  pageSize?: number;
  categoryId?: number | null;
  query?: string;
} = {}): Promise<BlogsPage> {
  const supabase = getStaticSupabaseClient();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * pageSize;

  const empty: BlogsPage = {
    blogs: [],
    total: 0,
    page: safePage,
    pageSize,
    totalPages: 0,
  };

  // A category filter needs the join table first; PostgREST cannot filter the
  // parent by an embedded resource without returning unmatched parents.
  let blogIdFilter: number[] | null = null;
  if (categoryId != null) {
    const { data: joinRows, error: joinError } = await supabase
      .from("blogs_category_join")
      .select("blog_id")
      .eq("category_id", categoryId);

    if (joinError) {
      console.error("Error fetching category blog IDs:", joinError);
      return empty;
    }
    blogIdFilter = (joinRows ?? []).map((row) => row.blog_id);
    if (blogIdFilter.length === 0) return empty;
  }

  let request = supabase
    .from("blogs")
    .select(BLOG_CARD_FIELDS, { count: "exact" })
    .eq("published", true);

  if (blogIdFilter) {
    request = request.in("id", blogIdFilter);
  }

  // Title/excerpt only — deliberately not `content`. An ILIKE over the article
  // body forces a full scan of the largest column in the table on every
  // keystroke-debounced request.
  const term = sanitizeSearchTerm(query);
  if (term) {
    request = request.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  }

  const {
    data: blogs,
    count,
    error,
  } = await request
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    console.error("Error fetching blogs page:", error);
    return empty;
  }

  const total = count ?? 0;

  return {
    blogs: (blogs ?? []).map((blog) => ({
      ...blog,
      categories: blog.categories?.map((cat: any) => cat.category) || [],
    })) as BlogCardData[],
    total,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Total published post count — used to enumerate static pagination routes. */
export const getPublishedBlogsCount = cache(async (): Promise<number> => {
  const supabase = getStaticSupabaseClient();

  const { count, error } = await supabase
    .from("blogs")
    .select("id", { count: "exact", head: true })
    .eq("published", true);

  if (error) {
    console.error("Error counting published blogs:", error);
    return 0;
  }

  return count ?? 0;
});

// Get featured blog (first published blog)
export async function getFeaturedBlog() {
  const supabase = getStaticSupabaseClient();

  const { data: blog, error } = await supabase
    .from("blogs")
    .select(BLOG_CARD_FIELDS)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !blog) {
    if (error) console.error("Error fetching featured blog:", error);
    return null;
  }

  return {
    ...blog,
    categories: blog.categories?.map((cat: any) => cat.category) || [],
  };
}

// Get latest articles (excluding featured)
export async function getLatestArticles(limit: number = 8) {
  const supabase = getStaticSupabaseClient();

  const { data: blogs, error } = await supabase
    .from("blogs")
    .select(BLOG_CARD_FIELDS)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(1, limit);

  if (error) {
    console.error("Error fetching latest articles:", error);
    return [];
  }

  return (
    blogs?.map((blog) => ({
      ...blog,
      categories: blog.categories?.map((cat: any) => cat.category) || [],
    })) || []
  );
}

/**
 * Curated collections, metadata only — cover image, title, slug, article count.
 *
 * Use this anywhere you are rendering *links* to collections. The full row
 * carries extended_content (long-form SEO HTML) and faqs, which are only ever
 * rendered on the collection page itself; pulling them into a listing would put
 * every collection's body into that page's payload.
 */
export const getCuratedCollectionsMeta = cache(async () => {
  const supabase = getStaticSupabaseClient();

  const { data: curated, error } = await supabase
    .from("blogs_curated")
    .select(
      `
      id,
      name,
      slug,
      image_url,
      blogs:blogs_curated_join(count)
    `
    )
    .order("name");

  if (error) {
    console.error("Error fetching curated collection metadata:", error);
    return [];
  }

  return (
    curated?.map((collection) => ({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      image_url: collection.image_url,
      articles_count: collection.blogs?.[0]?.count || 0,
    })) || []
  );
});

/**
 * One curated collection, full row, looked up by slug (or legacy numeric id).
 *
 * The collection page used to call getCuratedCollections() — every collection
 * with its `extended_content` and `faqs` — and then `.find()` the one it wanted.
 * That pulled ~20 long-form bodies from Postgres on every regeneration to render
 * one. This fetches exactly the row being rendered.
 */
export const getCuratedCollectionBySlug = cache(async (slug: string) => {
  const supabase = getStaticSupabaseClient();

  const asId = Number(slug);
  const isLegacyId = Number.isInteger(asId) && String(asId) === slug;

  const base = supabase.from("blogs_curated").select(
    `
      *,
      blogs:blogs_curated_join(count)
    `
  );

  const { data, error } = await (isLegacyId
    ? base.eq("id", asId)
    : base.eq("slug", slug)
  ).maybeSingle();

  if (error) {
    console.error("Error fetching curated collection:", error);
    return null;
  }
  if (!data) return null;

  return {
    ...data,
    articles_count: data.blogs?.[0]?.count || 0,
  } as BlogCurated;
});

/**
 * One page of a curated collection's articles.
 *
 * Replaces getBlogsByCuratedCollection(), which was hard-capped at 12 rows with
 * no pagination — a 40-article collection silently showed 12 and the other 28
 * had no link from anywhere on the site.
 */
export async function getCuratedCollectionBlogsPage({
  curatedId,
  page = 1,
  pageSize = BLOGS_PAGE_SIZE,
}: {
  curatedId: number;
  page?: number;
  pageSize?: number;
}): Promise<BlogsPage> {
  const supabase = getStaticSupabaseClient();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * pageSize;

  const empty: BlogsPage = {
    blogs: [],
    total: 0,
    page: safePage,
    pageSize,
    totalPages: 0,
  };

  const { data: joinRows, error: joinError } = await supabase
    .from("blogs_curated_join")
    .select("blog_id")
    .eq("curated_id", curatedId);

  if (joinError) {
    console.error("Error fetching curated collection blog IDs:", joinError);
    return empty;
  }

  const blogIds = (joinRows ?? []).map((row) => row.blog_id);
  if (blogIds.length === 0) return empty;

  const {
    data: blogs,
    count,
    error,
  } = await supabase
    .from("blogs")
    .select(BLOG_CARD_FIELDS, { count: "exact" })
    .eq("published", true)
    .in("id", blogIds)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    console.error("Error fetching curated collection blogs:", error);
    return empty;
  }

  const total = count ?? 0;

  return {
    blogs: (blogs ?? []).map((blog) => ({
      ...blog,
      categories: blog.categories?.map((cat: any) => cat.category) || [],
    })) as BlogCardData[],
    total,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// (getCuratedCollections — every collection with its full extended_content and
// faqs — and getBlogsByCuratedCollection — hard-capped at 12 rows — were both
// removed. Use getCuratedCollectionBySlug / getCuratedCollectionsMeta /
// getCuratedCollectionBlogsPage instead.)

// Get all categories
export async function getBlogCategories() {
  const supabase = getStaticSupabaseClient();

  const { data: categories, error } = await supabase
    .from("blogs_category")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }

  return categories || [];
}

// Get blog by slug.
//
// Wrapped in react.cache because [slug]/page.tsx calls this from both
// generateMetadata and the page body. react.cache dedupes within a single
// render pass, so the heavy select (this is the one query that legitimately
// pulls `content`) runs once per regeneration instead of twice.
//
// NOTE: this file deliberately has no "use server" directive. If one is ever
// added, every export must be an async function and this `cache(...)` const
// will break the build.
export const getBlogBySlug = cache(async (slug: string) => {
  const supabase = getStaticSupabaseClient();

  const { data: blog, error } = await supabase
    .from("blogs")
    .select(
      `
      *,
      categories:blogs_category_join(
        category:blogs_category(id, name)
      )
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !blog) {
    if (error) console.error("Error fetching blog by slug:", error);
    return null;
  }

  return {
    ...blog,
    categories: blog.categories?.map((cat: any) => cat.category) || [],
  };
});

/**
 * Slugs to pre-render at build time: the most recent posts, which are the ones
 * still being shared, crawled and indexed.
 *
 * Everything else is generated on the first request via `dynamicParams` and
 * then cached like any other ISR page. Generation is blocking, so crawlers
 * still get complete HTML with a 200 on that first hit.
 *
 * This used to also pre-build the top-N by `views`. That column is no longer
 * written — reads are tracked in PostHog — so ordering by it would just pin the
 * build set to a frozen snapshot that drifts further from reality every month.
 *
 * Tune without a code deploy via BLOG_PREBUILD_COUNT.
 */
export async function getPrebuildBlogSlugs(
  count = Number(process.env.BLOG_PREBUILD_COUNT ?? 50)
): Promise<{ slug: string }[]> {
  const supabase = getStaticSupabaseClient();

  const { data, error } = await supabase
    .from("blogs")
    .select("slug")
    .eq("published", true)
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(count);

  if (error) {
    console.error("Error fetching prebuild slugs:", error);
    return [];
  }

  return (data ?? [])
    .filter((row): row is { slug: string } => row.slug != null)
    .map((row) => ({ slug: row.slug }));
}

// Get related blogs by category (excluding current blog)
export async function getRelatedBlogsByCategory(
  categoryIds: number[],
  currentBlogId: number,
  limit: number = 6
) {
  const supabase = getStaticSupabaseClient();

  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }

  // First get the blog IDs from the join table
  const { data: blogIds, error: joinError } = await supabase
    .from("blogs_category_join")
    .select("blog_id")
    .in("category_id", categoryIds);

  if (joinError) {
    console.error("Error fetching category blog IDs:", joinError);
    return [];
  }

  if (!blogIds || blogIds.length === 0) {
    return [];
  }

  const blogIdArray = blogIds.map((item) => item.blog_id);

  // Then get the blogs with those IDs
  const { data: blogs, error } = await supabase
    .from("blogs")
    .select(BLOG_CARD_FIELDS)
    .eq("published", true)
    .neq("id", currentBlogId)
    .in("id", blogIdArray)
    // Was ordered by `views`; that column is no longer written (reads live in
    // PostHog), so recency is the honest signal.
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching related blogs:", error);
    return [];
  }

  return (
    blogs?.map((blog) => ({
      ...blog,
      categories: blog.categories?.map((cat: any) => cat.category) || [],
    })) || []
  );
}


