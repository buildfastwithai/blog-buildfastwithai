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

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Author Not Found",
      robots: { index: false, follow: false },
    };
  }

  return generateAuthorMetadata({
    authorName: author.name,
    authorBio: author.bio,
    slug: author.slug,
  });
}

export default async function AuthorPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const page = 1;
  const blogsPage = await getPublishedBlogsPage({ page });

  const canonical = `${BLOG_SITE_URL}/author/${author.slug}`;

  const personSchema = generatePersonSchema({
    name: author.name,
    jobTitle: author.role,
    url: canonical,
    description: author.bio,
    sameAs: Object.values(author.socials).filter(Boolean) as string[],
    worksFor: "Build Fast with AI",
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: MAIN_SITE_URL },
      { name: "Blog", url: BLOG_SITE_URL },
      { name: "Authors", url: `${BLOG_SITE_URL}/all` },
      { name: author.name, url: canonical },
    ],
  });

  const collectionSchema = generateCollectionPageSchema({
    name: `Articles written by ${author.name}`,
    description: author.bio,
    url: canonical,
    numberOfItems: blogsPage.total,
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
