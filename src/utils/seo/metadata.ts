import { Metadata } from "next";
import { Blog, BlogCategory } from "@/actions/blog.actions";
import { BLOG_SITE_URL, MAIN_SITE_URL } from "@/lib/urls";

const SITE_NAME = "Build Fast with AI";
// Canonicals/OG URLs point at the blog subdomain — that is where these pages
// are served from now. The main site only 308-redirects /blogs/* here.
const SITE_URL = BLOG_SITE_URL;
const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image.png`;

/**
 * Generate metadata for individual blog posts
 */
export function generateBlogMetadata({
  blog,
  categories,
  baseUrl = SITE_URL,
}: {
  blog: Blog;
  categories?: BlogCategory[];
  baseUrl?: string;
}): Metadata {
  const url = `${baseUrl}/${blog.slug}`;
  const imageUrl = blog.image_url || DEFAULT_OG_IMAGE;
  const keywords = blog.meta_keywords || categories?.map((cat) => cat.name).join(", ") || "";
  const rawDesc = blog.excerpt || "";
  const description =
    rawDesc.length > 160
      ? rawDesc.slice(0, 160).trim().replace(/\s+\S*$/, "") || rawDesc.slice(0, 157) + "..."
      : rawDesc;

  return {
    title: blog.title || "Blog Post",
    description: description || undefined,
    keywords,
    authors: [
      {
        name: blog.author_name || "Satvik Paramkusam",
        url: blog.author_url || `${baseUrl}/author/satvik-paramkusam`,
      },
    ],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title: blog.title || "",
      description: description || "",
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title || "",
        },
      ],
      publishedTime: blog.created_at || undefined,
      modifiedTime: (blog as any).updated_at || blog.created_at || undefined,
      tags: categories?.map((cat) => cat.name),
    },
    other: {
      "article:published_time": blog.created_at || "",
      "article:modified_time": (blog as any).updated_at || blog.created_at || "",
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title || "",
      description: description || "",
      images: [
        {
          url: imageUrl,
          alt: blog.title || "",
        },
      ],
      creator: "@buildfastwithai",
      site: "@buildfastwithai",
    },
    robots: {
      index: blog.published || false,
      follow: blog.published || false,
      googleBot: {
        index: blog.published || false,
        follow: blog.published || false,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const BLOGS_OG_IMAGE = "https://auth.buildfastwithai.com/storage/v1/object/public/assets/images/blogs%20og%20image.png";

/**
 * Generate metadata for blog listing page
 */
export function generateBlogListingMetadata({
  title = `Latest AI News, Models & Code Tutorials | ${SITE_NAME}`,
  description = "Stay updated with the latest AI news, model releases, tutorials, and code snippets. Master artificial intelligence development and build fast with AI.",
  baseUrl = SITE_URL,
}: {
  title?: string;
  description?: string;
  baseUrl?: string;
} = {}): Metadata {
  const url = baseUrl;

  return {
    title,
    description,
    keywords:
      "latest AI news,AI blog, new AI models, AI tutorials, machine learning code snippets, how to build AI, AI updates 2026, artificial intelligence development, LLM tutorials, generative AI frameworks, AI agent frameworks, software development with AI",
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: BLOGS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "Build Fast with AI Blog - Latest AI News and Tutorials",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [BLOGS_OG_IMAGE],
      creator: "@buildfastwithai",
      site: "@buildfastwithai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generate metadata for curated collection pages
 */
export function generateCollectionMetadata({
  collectionName,
  collectionDescription,
  collectionImageUrl,
  collectionId,
  slug,
  metaTitle,
  metaDescription,
  baseUrl = SITE_URL,
}: {
  collectionName: string;
  collectionDescription?: string;
  collectionImageUrl?: string;
  collectionId?: number | string;
  slug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  baseUrl?: string;
}): Metadata {
  const pathIdentifier = slug || collectionId;
  const url = `${baseUrl}/${pathIdentifier}`;

  // Use custom meta title if provided, otherwise fallback
  const title = metaTitle || `${collectionName} Articles & Guides | ${SITE_NAME}`;

  // Use custom meta description if provided, otherwise fallback
  const description =
    metaDescription ||
    collectionDescription ||
    `Explore our comprehensive collection of tutorials, articles, and guides on ${collectionName} to help you build faster with AI.`;

  const imageUrl = collectionImageUrl || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    keywords: [
      collectionName,
      `learn ${collectionName}`,
      `${collectionName} tutorials`,
      "ai development",
      "machine learning",
    ].join(", "),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${collectionName} Collection`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@buildfastwithai",
      site: "@buildfastwithai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generate metadata for all blogs page with filtering
 */
export function generateAllBlogsMetadata({
  searchQuery,
  baseUrl = SITE_URL,
}: {
  searchQuery?: string;
  baseUrl?: string;
} = {}): Metadata {
  const url = `${baseUrl}/all`;
  const title = searchQuery
    ? `Search Results for "${searchQuery}" | AI Articles & Code Snippets`
    : `All AI Articles, News & Tutorials (2026) | ${SITE_NAME}`;
  const description = searchQuery
    ? `Search results for "${searchQuery}" in our extensive database of AI models, machine learning tutorials, and code guides.`
    : "Browse our complete archive of articles covering the latest AI news, generative AI model releases, code snippets, Agent frameworks, and deep-learning tutorials.";

  return {
    title,
    description,
    keywords: [
      "latest AI news",
      "new AI models",
      "generative AI tutorials",
      "machine learning code snippets",
      "AI agent frameworks",
      "Langchain tutorials",
      "artificial intelligence insights",
      "build AI software",
      "AI models benchmark",
      "LLM code examples",
    ].join(", "),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: BLOGS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [BLOGS_OG_IMAGE],
      creator: "@buildfastwithai",
      site: "@buildfastwithai",
    },
    robots: {
      index: !searchQuery, // Don't index search result pages to prevent duplicate content, but DO index /all
      follow: true,
      googleBot: {
        index: !searchQuery,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generate metadata for author profile pages
 */
export function generateAuthorMetadata({
  authorName,
  authorBio,
  slug,
  baseUrl = SITE_URL,
}: {
  authorName: string;
  authorBio?: string;
  slug: string;
  baseUrl?: string;
}): Metadata {
  const url = `${baseUrl}/author/${slug}`;
  const title = `${authorName} - Author & AI Engineer | ${SITE_NAME}`;
  const description =
    authorBio ||
    `Read all articles, deep-dive tutorials, and guides written by ${authorName} on ${SITE_NAME}.`;

  return {
    title,
    description,
    keywords: `${authorName}, ${authorName} blog, AI engineering, generative AI, Build Fast with AI`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [
        {
          url: BLOGS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [BLOGS_OG_IMAGE],
      creator: "@buildfastwithai",
      site: "@buildfastwithai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Calculate reading time based on word count
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extract plain text from HTML content
 */
export function extractTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

