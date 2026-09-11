import {
  getBlogBySlug,
  getPrebuildBlogSlugs,
  getRelatedBlogsByCategory,
} from "@/actions/blog.actions";
import { BlogLayout } from "@/app/_components/blogspage/blog-layout";
import { BlogViewTracker } from "@/app/_components/blogspage/blog-view-tracker";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  combineSchemas,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  extractFAQsFromHTML,
} from "@/utils/seo/json-ld";
import { generateBlogMetadata } from "@/utils/seo/metadata";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogUrl, MAIN_SITE_URL } from "@/lib/urls";

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
  return getPrebuildBlogSlugs();
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    // noindex matters here: with dynamicParams every junk URL under /
    // renders this branch, and we don't want them treated as thin content.
    return {
      title: "Article Not Found",
      robots: { index: false, follow: false },
    };
  }

  const categories = blog.categories ?? [];
  return generateBlogMetadata({
    blog,
    categories,
  });
}

export default async function BlogPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
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
