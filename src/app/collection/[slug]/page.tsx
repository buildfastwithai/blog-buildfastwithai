import { Metadata } from "next";
import {
  getCuratedCollectionBySlug,
  getCuratedCollectionsMeta,
} from "@/actions/blog.actions";
import { generateCollectionMetadata } from "@/utils/seo/metadata";
import CollectionView from "../../_components/(collections-page)/collection-view";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

export async function generateStaticParams() {
  // Metadata-only: this needs slugs, not every collection's long-form body.
  const collections = await getCuratedCollectionsMeta();
  return collections.map((c) => ({ slug: c.slug || String(c.id) }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCuratedCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found",
      robots: { index: false, follow: false },
    };
  }

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

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  return <CollectionView slug={slug} page={1} />;
}
