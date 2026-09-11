import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BLOGS_PAGE_SIZE,
  getCuratedCollectionBySlug,
  getCuratedCollectionsMeta,
} from "@/actions/blog.actions";
import { generateCollectionMetadata } from "@/utils/seo/metadata";
import { blogUrl } from "@/lib/urls";
import CollectionView from "../../../../_components/(collections-page)/collection-view";

interface PageProps {
  params: Promise<{ slug: string; page: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

/**
 * Pre-generate every page of every collection. Each is a small ISR entry, and
 * together they give crawlers a link path to every article in a collection —
 * previously only the first 12 were reachable.
 */
export async function generateStaticParams() {
  const collections = await getCuratedCollectionsMeta();

  return collections.flatMap((collection) => {
    const totalPages = Math.ceil(
      (collection.articles_count ?? 0) / BLOGS_PAGE_SIZE
    );
    const slug = collection.slug || String(collection.id);

    // Page 1 lives at the collection root, so this route starts at 2.
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      slug,
      page: String(i + 2),
    }));
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, page } = await params;
  const pageNumber = Number(page);
  const collection = await getCuratedCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found",
      robots: { index: false, follow: false },
    };
  }

  const base = generateCollectionMetadata({
    collectionName: collection.name || "Collection",
    collectionDescription: collection.description || undefined,
    collectionImageUrl: collection.image_url || undefined,
    collectionId: collection.id,
    slug: collection.slug,
    metaTitle: collection.meta_title,
    metaDescription: collection.meta_description,
  });

  return {
    ...base,
    title: `${base.title} | Page ${pageNumber}`,
    alternates: {
      // Self-referencing canonical: paginated pages are their own content.
      canonical: blogUrl(
        `/collection/${collection.slug || collection.id}/page/${pageNumber}`
      ),
    },
  };
}

export default async function CollectionPaginatedPage({ params }: PageProps) {
  const { slug, page } = await params;
  const pageNumber = Number(page);

  // Reject /page/abc and /page/1 (which is the collection root) so we never
  // serve two URLs for identical content.
  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  return <CollectionView slug={slug} page={pageNumber} />;
}
