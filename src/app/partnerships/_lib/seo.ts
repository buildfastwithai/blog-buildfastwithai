import type { Metadata } from "next";
import { blogUrl, MAIN_SITE_URL } from "@/lib/urls";

const SITE_NAME = "Build Fast with AI";

// Bump DATE_MODIFIED when the content of these pages changes.
export const DATE_PUBLISHED = "2026-10-15";
export const DATE_MODIFIED = "2026-10-16";

/**
 * Metadata shared by the partnerships pages. `title` must stay within ~60
 * characters and `description` within ~160, or Google truncates them in results.
 * The root layout's title template is "%s", so `title` is used as written.
 */
export function partnershipMetadata({
  title,
  description,
  path,
  keywords,
  socialTitle,
}: {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  /** Longer title for link previews, where the 60-character limit does not apply. */
  socialTitle?: string;
}): Metadata {
  const url = blogUrl(path);
  const shareTitle = socialTitle ?? title;
  // Static file in public/og. Set explicitly because a page-level openGraph
  // object replaces the one inherited from the layout.
  const ogImage = {
    url: blogUrl("/og/parternership-og.png"),
    width: 1672,
    height: 941,
    alt: "Write for Build Fast with AI: guest posts, sponsored articles and SEO content",
  };

  return {
    title,
    description,
    keywords,
    authors: [{ name: SITE_NAME, url: MAIN_SITE_URL }],
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      title: shareTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      site: "@buildfastwithai",
      title: shareTitle,
      description,
      images: [ogImage.url],
    },
  };
}

/** WebPage schema with the publish and modified dates search tools look for. */
export function webPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  const url = blogUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name,
    description,
    url,
    inLanguage: "en",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    isPartOf: { "@type": "WebSite", name: `${SITE_NAME} Blog`, url: blogUrl("/") },
    publisher: { "@type": "Organization", name: SITE_NAME, url: MAIN_SITE_URL },
  };
}

const SERVICE_NAMES = [
  "Sponsored Article & Guest Post",
  "Contextual Mention",
  "In-Blog CTA Placement",
  "Tool Review",
  "X (Twitter) Promotion",
  "Monthly Content Package",
  "SEO & Content for Your Site",
];

/** Service schema describing the partnership offers on the home page. */
export function partnershipServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Guest posts, sponsored articles and SEO content on Build Fast with AI",
    serviceType: "Sponsored content and guest posting",
    url: blogUrl("/partnerships"),
    areaServed: "Worldwide",
    provider: { "@type": "Organization", name: SITE_NAME, url: MAIN_SITE_URL },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Partnership services",
      itemListElement: SERVICE_NAMES.map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
  };
}
