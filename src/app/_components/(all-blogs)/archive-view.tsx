import { BLOG_SITE_URL } from "@/lib/urls";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getBlogCategories,
  getPublishedBlogsPage,
} from "@/actions/blog.actions";
import AllBlogsClient from "./all-blogs-client";
import AiReadinessCtaFull from "@/components/cta-cards/ai-readiness-cta-full";
import ClaudeMasteryCtaFull from "@/components/cta-cards/claude-mastery-cta-full";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateWebSiteSchema,
  generateCollectionPageSchema,
  combineSchemas,
} from "@/utils/seo/json-ld";

const BASE_PATH = "/all";
const SITE = BLOG_SITE_URL;

/**
 * The archive listing, shared by /all (page 1) and /all/page/[page].
 *
 * Fetches exactly one page of cards. The old version pulled every published row
 * and passed the lot into a client component; this ships ~24 cards per route
 * and each page is its own small ISR entry.
 */
export default async function ArchiveView({ page }: { page: number }) {
  const [categories, blogsPage] = await Promise.all([
    getBlogCategories(),
    getPublishedBlogsPage({ page }),
  ]);

  // Out-of-range page numbers should 404, not render an empty grid that Google
  // would treat as a thin duplicate of the archive.
  if (page > 1 && blogsPage.blogs.length === 0) {
    notFound();
  }

  const canonical = page === 1 ? `${SITE}${BASE_PATH}` : `${SITE}${BASE_PATH}/page/${page}`;

  const structuredData = combineSchemas(
    generateWebSiteSchema({
      name: "Build Fast with AI Blog Architecture",
      url: `${SITE}${BASE_PATH}`,
    }),
    generateCollectionPageSchema({
      name:
        page === 1
          ? "All AI Articles, News, and Framework Tutorials"
          : `All AI Articles, News, and Framework Tutorials | Page ${page}`,
      description:
        "Browse our complete archive of articles covering the latest AI news, generative AI model releases, code snippets, Agent frameworks, and deep-learning tutorials.",
      url: canonical,
      numberOfItems: blogsPage.blogs.length,
    })
  );

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={structuredData} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>

          {page > 1 && (
            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground mb-3">
              Page {page}
            </span>
          )}

          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
            All AI Articles, News &amp; Tutorials (2026)
          </h1>

          {/* Intro copy on page 1 only — repeating it on every paginated page
              is duplicate boilerplate and pushes the grid down the fold. */}
          {page === 1 && (
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              Explore our complete collection of AI articles, including latest
              model releases, coding tutorials, agent frameworks, and industry
              insights. Stay updated with practical guides and real-world AI
              applications to build faster in 2026.
            </p>
          )}
        </div>

        <AllBlogsClient
          initialPage={blogsPage}
          categories={categories}
          basePath={BASE_PATH}
        />

        <div className="max-w-5xl mx-auto mb-24 space-y-12">
          <AiReadinessCtaFull />
          <ClaudeMasteryCtaFull />
        </div>
      </div>
    </main>
  );
}
