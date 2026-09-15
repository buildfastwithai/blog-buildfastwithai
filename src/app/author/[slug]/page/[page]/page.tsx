import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedBlogsPage } from "@/actions/blog.actions";
import { getAuthorBySlug } from "@/lib/author";
import { generateAuthorMetadata } from "@/utils/seo/metadata";
import {
  generatePersonSchema,
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  combineSchemas,
} from "@/utils/seo/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";
import { BLOG_SITE_URL, MAIN_SITE_URL } from "@/lib/urls";
import AuthorProfileView from "@/app/_components/(author-page)/author-profile-view";

export const revalidate = 3600;

export async function generateMetadata(props: {
  params: Promise<{ slug: string; page: string }>;
}): Promise<Metadata> {
  const { slug, page } = await props.params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Author Not Found",
      robots: { index: false, follow: false },
    };
  }

  const meta = generateAuthorMetadata({
    authorName: author.name,
    authorBio: author.bio,
    slug: author.slug,
  });

  return {
    ...meta,
    title: `${author.name} - Page ${page} | Build Fast with AI`,
    alternates: {
      canonical: `${BLOG_SITE_URL}/author/${author.slug}/page/${page}`,
    },
    // With a single author these pages list exactly what /all/page/N lists.
    // Keep them crawlable so links to posts are followed, but do not index a
    // second copy of the archive.
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
  };
}

export default async function AuthorPaginatedPage(props: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const { slug, page: pageStr } = await props.params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 1) {
    notFound();
  }

  const blogsPage = await getPublishedBlogsPage({ page });

  if (blogsPage.blogs.length === 0) {
    notFound();
  }

  const canonical = `${BLOG_SITE_URL}/author/${author.slug}/page/${page}`;

  const personSchema = generatePersonSchema({
    name: author.name,
    jobTitle: author.role,
    url: `${BLOG_SITE_URL}/author/${author.slug}`,
    description: author.bio,
    sameAs: Object.values(author.socials).filter(Boolean) as string[],
    worksFor: "Build Fast with AI",
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: MAIN_SITE_URL },
      { name: "Blog", url: BLOG_SITE_URL },
      { name: "Authors", url: `${BLOG_SITE_URL}/all` },
      { name: author.name, url: `${BLOG_SITE_URL}/author/${author.slug}` },
      { name: `Page ${page}`, url: canonical },
    ],
  });

  const collectionSchema = generateCollectionPageSchema({
    name: `Articles written by ${author.name} - Page ${page}`,
    description: author.bio,
    url: canonical,
    numberOfItems: blogsPage.blogs.length,
  });

  const structuredData = combineSchemas(
    personSchema,
    breadcrumbSchema,
    collectionSchema
  );

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={structuredData} />
      <AuthorProfileView author={author} blogsPage={blogsPage} page={page} />
    </main>
  );
}
