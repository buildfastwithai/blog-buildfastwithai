import {
  getBlogBySlug,
  getCuratedCollectionBySlug,
  getCuratedCollectionsMeta,
  getPrebuildBlogSlugs,
  getRelatedBlogsByCategory,
} from "@/actions/blog.actions";
import { BlogLayout } from "@/app/_components/blogspage/blog-layout";
import { BlogViewTracker } from "@/app/_components/blogspage/blog-view-tracker";
import CollectionView from "@/app/_components/(collections-page)/collection-view";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogUrl, MAIN_SITE_URL } from "@/lib/urls";
import {
  combineSchemas,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  extractFAQsFromHTML,
} from "@/utils/seo/json-ld";
import {
  generateBlogMetadata,
  generateCollectionMetadata,
} from "@/utils/seo/metadata";
import { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * One route, two kinds of page.
 *
 * Articles and curated collections both live at the root of the blog domain
 * (`/<article-slug>`, `/<collection-slug>`) — the old `/collection/` prefix is
 * gone. An article is looked up first; if there is none, the slug is tried as
 * a collection. If an article and a collection ever share a slug, the article
 * wins, so keep collection slugs distinct when creating them.
 */

// Slugs not returned by generateStaticParams are rendered on the first request
// and then cached like any other ISR page. Generation is blocking, so crawlers
// always receive complete HTML with a 200 — never an empty shell. This is the
// App Router equivalent of the Pages Router's `fallback: "blocking"`.
// Flipping this to false would 404 every post outside the pre-build set.
export const dynamicParams = true;

// Safety net only. Published/edited posts are pushed live via
// /api/revalidate/blog; this timer is the backstop if nobody calls it.
export const revalidate = 86400; // 24 hours

export async function generateStaticParams() {
  const [blogSlugs, collections] = await Promise.all([
    getPrebuildBlogSlugs(),
    // Metadata-only: this needs slugs, not every collection's long-form body.
    getCuratedCollectionsMeta(),
  ]);

  return [
    ...blogSlugs,
    ...collections.map((c) => ({ slug: c.slug || String(c.id) })),
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const blog = await getBlogBySlug(params.slug);

  if (blog) {
    return generateBlogMetadata({
      blog,
      categories: blog.categories ?? [],
    });
  }

  const collection = await getCuratedCollectionBySlug(params.slug);

  if (collection) {
    return generateCollectionMetadata({
      collectionName: collection.name || "Collection",
      collectionDescription: collection.description || undefined,
      collectionImageUrl: collection.image_url || undefined,
      collectionId: collection.id,
      slug: collection.slug,
      metaTitle: collection.meta_title,
      metaDescription: collection.meta_description,
    });
  }

  // noindex matters here: with dynamicParams every junk URL under /
  // renders this branch, and we don't want them treated as thin content.
  return {
    title: "Article Not Found",
    robots: { index: false, follow: false },
  };
}

export default async function BlogPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    // Not an article — maybe a curated collection. CollectionView itself
    // calls notFound() when the slug matches neither.
    return <CollectionView slug={params.slug} page={1} />;
  }

  const categoryIds =
    blog.categories?.map((cat: { id: number }) => cat.id) ?? [];
  const relatedBlogs =
    categoryIds.length > 0
      ? await getRelatedBlogsByCategory(categoryIds, blog.id, 6)
      : [];

  const transformedBlog = {
    ...blog,
    categories: blog.categories ?? [],
  };

  const articleUrl = blogUrl(`/${params.slug}`);
  const articleSchema = generateArticleSchema({
    blog,
    categories: transformedBlog.categories,
    url: articleUrl,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: MAIN_SITE_URL },
      { name: "Blog", url: blogUrl("/") },
      { name: blog.title || "Article", url: articleUrl },
    ],
  });

  const faqs = extractFAQsFromHTML(blog.content || "");
  const faqSchema = generateFAQSchema({ faqs });

  const structuredData = combineSchemas(articleSchema, breadcrumbSchema, faqSchema);

  return (
    <main className="bg-background min-h-screen">
      <BlogViewTracker
        slug={params.slug}
        title={blog.title}
        blogId={blog.id}
      />
      <JsonLd data={structuredData} />

      <BlogLayout blog={transformedBlog} relatedBlogs={relatedBlogs} />
    </main>
  );
}
