import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BLOGS_PAGE_SIZE,
  getPublishedBlogsCount,
} from "@/actions/blog.actions";
import { generateAllBlogsMetadata } from "@/utils/seo/metadata";
import { blogUrl } from "@/lib/urls";
import ArchiveView from "../../../_components/(all-blogs)/archive-view";

interface PageProps {
  params: Promise<{ page: string }>;
}

export const revalidate = 3600;
export const dynamicParams = true;

/**
 * Statically generate every archive page so crawlers can walk the whole
 * back-catalogue through real links. Each page is a small ISR entry (~24 cards)
 * rather than one enormous document listing every post.
 */
export async function generateStaticParams() {
  const total = await getPublishedBlogsCount();
  const totalPages = Math.ceil(total / BLOGS_PAGE_SIZE);

  // Page 1 lives at /all, so this route starts at 2.
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = Number(page);

  const base = generateAllBlogsMetadata({});

  return {
    ...base,
    title: `${base.title} | Page ${pageNumber}`,
    alternates: {
      // Self-referencing canonical: paginated pages are distinct content, not
      // duplicates of page 1.
      canonical: blogUrl(`/all/page/${pageNumber}`),
    },
  };
}

export default async function AllBlogsPaginatedPage({ params }: PageProps) {
  const { page } = await params;
  const pageNumber = Number(page);

  // Reject /page/abc and /page/1 (which is /all) so we don't serve a
  // second URL for identical content.
  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  return <ArchiveView page={pageNumber} />;
}
