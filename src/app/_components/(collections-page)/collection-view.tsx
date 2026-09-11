import { BLOG_SITE_URL, MAIN_SITE_URL } from "@/lib/urls";
import { notFound } from "next/navigation";
import {
  getCuratedCollectionBlogsPage,
  getCuratedCollectionBySlug,
  getCuratedCollectionsMeta,
} from "@/actions/blog.actions";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateCollectionPageSchema,
  generateBreadcrumbSchema,
  combineSchemas,
} from "@/utils/seo/json-ld";
import Header from "./header";
import CollectionsCards from "./collections-cards";
import Sidebar from "./sidebar";
import CollectionPagination from "./collection-pagination";
import AgenticCta from "../cta/agentic-cta";
import ClaudeCta from "../cta/claude-cta";
import AiReadinessCta from "../cta/ai-readiness-cta";
import VibeCheckCta from "../cta/vibe-check-cta";
import PromptLibraryCta from "../cta/prompt-library-cta";
import NewsletterCTA from "../news-letter-cta";
import UnrotCta from "../cta/unrot-cta";
import AiToolsCta from "../cta/ai-tools-cta";
import CorporateTrainingCta from "../cta/corporate-training-cta";
import AiWorkshopCta from "../cta/ai-workshop-cta";

const CTA_MAP: Record<string, any> = {
  "agentic": AgenticCta,
  "claude": ClaudeCta,
  "ai-readiness": AiReadinessCta,
  "vibe-check": VibeCheckCta,
  "prompt-library": PromptLibraryCta,
  "newsletter": NewsletterCTA,
  "unrot": UnrotCta,
  "ai-tools": AiToolsCta,
  "corporate": CorporateTrainingCta,
  "ai-workshop": AiWorkshopCta,
};
const SITE = BLOG_SITE_URL;

/**
 * A curated collection page, shared by page 1 and /page/[page].
 *
 * Fetches only the collection being rendered (not all ~20 with their long-form
 * bodies) and only one page of its articles (not a hard-capped 12).
 */
export default async function CollectionView({
  slug,
  page,
}: {
  slug: string;
  page: number;
}) {
  const collection = await getCuratedCollectionBySlug(slug);
  if (!collection) notFound();

  const [blogsPage, allCollections] = await Promise.all([
    getCuratedCollectionBlogsPage({ curatedId: collection.id, page }),
    getCuratedCollectionsMeta(),
  ]);

  // Out-of-range pages must 404, not render an empty grid.
  if (page > 1 && blogsPage.blogs.length === 0) notFound();

  const basePath = `/collection/${collection.slug || collection.id}`;
  const canonical = page === 1 ? `${SITE}${basePath}` : `${SITE}${basePath}/page/${page}`;
  const isFirstPage = page === 1;

  let activeCtas: string[] = [];
  if (collection && Array.isArray((collection as any).active_ctas)) {
    activeCtas = (collection as any).active_ctas;
  }

  const renderCta = (index: number) => {
    const ctaKey = activeCtas[index];
    if (!ctaKey) return null;
    const CtaComponent = CTA_MAP[ctaKey];
    return CtaComponent ? <CtaComponent /> : null;
  };

  let structuredData = combineSchemas(
    generateCollectionPageSchema({
      name: collection.name || "Collection",
      description:
        collection.meta_description || collection.description || "",
      url: canonical,
      numberOfItems: blogsPage.blogs.length,
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: MAIN_SITE_URL },
        { name: "Blog", url: SITE },
        { name: collection.name || "Collection", url: `${SITE}${basePath}` },
      ],
    })
  );

  // Long-form SEO content and FAQs belong on page 1 only — repeating them on
  // every paginated page would be duplicate content.
  let parsedFaqs: any[] | null = null;
  if (isFirstPage && collection.faqs) {
    parsedFaqs =
      typeof collection.faqs === "string"
        ? JSON.parse(collection.faqs)
        : collection.faqs;

    if (Array.isArray(parsedFaqs) && parsedFaqs.length > 0) {
      structuredData = combineSchemas(structuredData, {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: parsedFaqs.map((faq: any) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      });
    }
  }

  const firstThree = blogsPage.blogs.slice(0, 3);
  const remaining = blogsPage.blogs.slice(3);

  return (
    <main className="min-h-screen bg-background py-6 lg:py-8">
      <JsonLd data={structuredData} />

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <Header
          title={collection.name || "Collection"}
          description={collection.description || ""}
          articleCount={blogsPage.total}
          image_url={collection.image_url || ""}
          page={page}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 flex flex-col gap-12">
            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-border" />
                Curated Articles &amp; Updates
              </h2>
              <CollectionsCards blogs={firstThree} />
            </section>

            {renderCta(0)}

            {remaining.length > 0 && (
              <section className="mt-8">
                <CollectionsCards blogs={remaining} />
              </section>
            )}

            {blogsPage.totalPages > 1 && (
              <CollectionPagination
                basePath={basePath}
                page={blogsPage.page}
                totalPages={blogsPage.totalPages}
              />
            )}

            {renderCta(1)}

            {isFirstPage && collection.extended_content && (
              <section
                className="prose prose-invert max-w-none text-muted-foreground bg-muted/20 p-8 rounded-2xl border border-border"
                dangerouslySetInnerHTML={{
                  __html: collection.extended_content,
                }}
              />
            )}

            {renderCta(2)}

            {isFirstPage && parsedFaqs && parsedFaqs.length > 0 && (
              <section className="bg-muted/10 p-8 rounded-2xl border border-border">
                <h3 className="text-2xl font-bold mb-6 text-foreground text-left">
                  Frequently Asked Questions
                </h3>
                <div className="flex flex-col gap-6">
                  {parsedFaqs.map((faq: any, i: number) => (
                    <div key={i} className="flex flex-col gap-2">
                      <h4 className="font-semibold text-lg text-foreground">
                        {faq.question}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {renderCta(3)}
          </div>

          <div className="lg:col-span-4">
            <Sidebar
              collections={allCollections}
              currentCollectionId={collection.id}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
