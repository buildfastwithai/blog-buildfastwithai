import { Blog, BlogCategory } from "@/actions/blog.actions";

type WithGraph = {
  "@graph": unknown[];
};

type JsonLdObject = Record<string, unknown> | WithGraph;

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema({
  blog,
  categories,
  url,
  authorName = "Satvik Paramkusham",
  organizationName = "Build Fast with AI",
  organizationLogo = "https://www.buildfastwithai.com/dark_logo.png",
}: {
  blog: Blog;
  categories?: BlogCategory[];
  url: string;
  authorName?: string;
  organizationName?: string;
  organizationLogo?: string;
}): JsonLdObject {
  const publishedDate = blog.created_at || new Date().toISOString();
  // Use updated_at if available, otherwise fall back to created_at
  const modifiedDate =
    (blog as any).updated_at || blog.created_at || new Date().toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title || "",
    description: blog.excerpt || "",
    image: blog.image_url
      ? {
        "@type": "ImageObject",
        url: blog.image_url,
        width: 1200,
        height: 630,
      }
      : undefined,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      "@type": "Person",
      name: blog.author_name || authorName,
      url: blog.author_url || "https://www.buildfastwithai.com/about", // Generic author URL or add specific author bio URL if available
    },
    publisher: {
      "@type": "Organization",
      name: organizationName,
      logo: {
        "@type": "ImageObject",
        url: organizationLogo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: blog.meta_keywords
      ? blog.meta_keywords
      : categories && categories.length > 0
        ? categories.map((cat) => cat.name).join(", ")
        : undefined,
    ...(categories && categories.length > 0
      ? {
        articleSection: categories.map((cat) => cat.name),
      }
      : {}),
    // No interactionStatistic: read counts now live in PostHog, so anything
    // stored on the row is a frozen snapshot. Stale counts in structured data
    // are worse than omitting the field.
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate CollectionPage schema for blog listing pages
 */
export function generateCollectionPageSchema({
  name,
  description,
  url,
  numberOfItems,
}: {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    ...(numberOfItems ? { numberOfItems } : {}),
  };
}

/**
 * Generate Organization schema (site-wide)
 */
export function generateOrganizationSchema({
  name = "Build Fast with AI",
  url = "https://www.buildfastwithai.com",
  logo = "https://www.buildfastwithai.com/dark_logo.png",
  description = "Educational platform for AI/ML development with hands-on courses, workshops, and community",
  sameAs = [
    "https://x.com/buildfastwithai",
    "https://www.linkedin.com/company/build-fast-with-ai",
    "https://www.youtube.com/@buildfastwithai",
    "https://www.instagram.com/buildfastwithai/",
    "https://github.com/buildfastwithai",
  ],
}: {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
} = {}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name,
    url,
    logo: {
      "@type": "ImageObject",
      url: logo,
    },
    description,
    sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${url}/contact`,
    },
  };
}

/**
 * Generate FAQ schema from content
 */
export function generateFAQSchema({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}): JsonLdObject | null {
  if (faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Extract FAQs from HTML content
 */
export function extractFAQsFromHTML(html: string): { question: string; answer: string }[] {
  if (!html) return [];

  // Find the FAQ section by commonly used headers
  const faqHeaderRegex = /<h2[^>]*>.*?(Frequently Asked Questions|FAQ|FAQs).*?<\/h2>/i;
  const match = html.match(faqHeaderRegex);

  if (!match) return [];

  // Get content after the FAQ header
  const faqSection = html.slice(match.index! + match[0].length);

  // We only look until the next h2
  let sectionContent = faqSection;
  const nextH2Match = faqSection.match(/<h2[^>]*>/i);
  if (nextH2Match) {
    sectionContent = faqSection.slice(0, nextH2Match.index);
  }

  const faqs: { question: string; answer: string }[] = [];
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;

  const matches = Array.from(sectionContent.matchAll(h3Regex));

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = i + 1 < matches.length ? matches[i + 1] : null;

    const question = currentMatch[1].replace(/<[^>]*>/g, '').trim();

    const answerStart = currentMatch.index + currentMatch[0].length;
    const answerEnd = nextMatch ? nextMatch.index : sectionContent.length;

    const rawAnswer = sectionContent.slice(answerStart, answerEnd).trim();
    // Convert HTML tags to spaces to avoid merging words, then collapse spaces
    const answer = rawAnswer.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema({
  name = "Build Fast with AI",
  url = "https://www.buildfastwithai.com",
  searchUrl = "https://blog.buildfastwithai.com/all?search={search_term_string}",
}: {
  name?: string;
  url?: string;
  searchUrl?: string;
} = {}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: searchUrl,
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@id": `${url}/#organization`,
    },
  };
}

/**
 * Generate Course schema for educational content
 */
export function generateCourseSchema({
  name,
  description,
  url,
  price,
  currency = "INR",
  rating,
  reviewCount,
  duration,
  instructor,
  image,
}: {
  name: string;
  description: string;
  url: string;
  price: string;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  instructor?: string;
  image?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url,
    ...(image ? { image } : {}),
    provider: {
      "@type": "Organization",
      name: "Build Fast with AI",
      sameAs: "https://www.buildfastwithai.com",
    },
    ...(instructor
      ? {
        instructor: {
          "@type": "Person",
          name: instructor,
        },
      }
      : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      ...(duration ? { courseWorkload: duration } : {}),
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      url,
    },
    ...(rating && reviewCount
      ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating.toString(),
          reviewCount: reviewCount.toString(),
          bestRating: "5",
          worstRating: "1",
        },
      }
      : {}),
  };
}

/**
 * Generate Event schema for workshops and events
 */
export function generateEventSchema({
  name,
  description,
  startDate,
  endDate,
  url,
  image,
  isOnline = false,
  location,
  price,
  currency = "INR",
  performers,
}: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  url: string;
  image?: string;
  isOnline?: boolean;
  location?: {
    name?: string;
    address?: string;
    city?: string;
  };
  price?: string;
  currency?: string;
  performers?: { name: string; role?: string }[];
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name,
    description,
    ...(image ? { image } : {}),
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: isOnline
      ? {
        "@type": "VirtualLocation",
        url,
      }
      : {
        "@type": "Place",
        name: location?.name || "Venue",
        address: {
          "@type": "PostalAddress",
          streetAddress: location?.address,
          addressLocality: location?.city || "Bangalore",
          addressRegion: "Karnataka",
          addressCountry: "IN",
        },
      },
    organizer: {
      "@type": "Organization",
      name: "Build Fast with AI",
      url: "https://www.buildfastwithai.com",
    },
    ...(performers && performers.length > 0
      ? {
        performer: performers.map((performer) => ({
          "@type": "Person",
          name: performer.name,
        })),
      }
      : {}),
    ...(price
      ? {
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: currency,
          availability: "https://schema.org/InStock",
          url,
        },
      }
      : {}),
  };
}

/**
 * Generate Service schema for service pages (e.g. corporate training, consulting)
 */
export function generateServiceSchema({
  name,
  description,
  url,
  serviceType,
  image,
  areaServed = ["IN", "Worldwide"],
  audienceType,
  catalogName,
  catalogItems,
}: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  image?: string;
  areaServed?: string[];
  audienceType?: string;
  catalogName?: string;
  catalogItems?: { name: string; description: string }[];
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}/#service`,
    name,
    description,
    url,
    serviceType,
    ...(image ? { image } : {}),
    provider: {
      "@id": "https://www.buildfastwithai.com/#organization",
    },
    areaServed,
    ...(audienceType
      ? {
        audience: {
          "@type": "BusinessAudience",
          audienceType,
        },
      }
      : {}),
    ...(catalogItems && catalogItems.length > 0
      ? {
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: catalogName || name,
          itemListElement: catalogItems.map((item) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: item.name,
              description: item.description,
            },
          })),
        },
      }
      : {}),
  };
}

/**
 * Combine multiple JSON-LD schemas into a single graph
 */
export function combineSchemas(...schemas: (JsonLdObject | null)[]): WithGraph {
  const validSchemas = schemas.filter(
    (schema): schema is JsonLdObject => schema !== null
  );

  return {
    "@graph": validSchemas,
  };
}
