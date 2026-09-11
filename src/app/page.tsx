import {
  getCuratedCollectionsMeta,
  getFeaturedBlog,
  getLatestArticles,
} from "@/actions/blog.actions";
import { generateBlogListingMetadata } from "@/utils/seo/metadata";
import CollectionsSection from "./_components/(landing)/collections-section";
import FeaturedStories from "./_components/(landing)/featured-stories";
import Hero from "./_components/(landing)/hero-section";
import LatestExplorations from "./_components/(landing)/latest-explorations";
import Newsletter from "./_components/(landing)/newsletter-section";
import { Post } from "./_components/(landing)/types";
import { generateWebSiteSchema, generateCollectionPageSchema, combineSchemas } from "@/utils/seo/json-ld";
import GooglePreferredSourceSection from "./_components/(landing)/google-preferred-source-section";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogUrl } from "@/lib/urls";

// Helper function to transform DB Blog to UI Post
function transformBlogToPost(blog: any): Post {
  return {
    id: blog.id,
    title: blog.title || "Untitled",
    excerpt: blog.excerpt || "",
    category:
      blog.categories && blog.categories.length > 0
        ? blog.categories[0].name
        : "General",
    date: new Date(blog.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    readTime: "5 min read",
    imageUrl: blog.image_url,
    slug: blog.slug,
  };
}

export const metadata = generateBlogListingMetadata();

// Single page, so an hourly cadence is cheap — and it means a newly published
// post shows up in the listing within the hour with no manual revalidation.
export const revalidate = 3600;

export default async function BlogsPage() {
  const [featuredBlogData, latestBlogsData, collections] = await Promise.all([
    getFeaturedBlog(),
    getLatestArticles(12),
    getCuratedCollectionsMeta(),
  ]);

  const featuredPost = featuredBlogData
    ? transformBlogToPost(featuredBlogData)
    : undefined;

  const allLatestPosts = latestBlogsData.map(transformBlogToPost);

  const topStories = allLatestPosts.slice(0, 3);
  const allPosts = allLatestPosts.slice(3);

  // Generate structured data for SEO visibility
  const webSiteSchema = generateWebSiteSchema({
    name: "Build Fast with AI Blog",
    url: blogUrl("/"),
    searchUrl: blogUrl("/all?search={search_term_string}"),
  });

  const collectionSchema = generateCollectionPageSchema({
    name: "Latest AI News, Models & Code Tutorials",
    description: "Stay updated with the latest AI news, new model releases, deep-dive tutorials, and code snippets.",
    url: blogUrl("/"),
    numberOfItems: allLatestPosts.length + (featuredPost ? 1 : 0),
  });

  const structuredData = combineSchemas(webSiteSchema, collectionSchema);

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={structuredData} />
      
      {/* Primary SEO Heading */}
      <h1 className="sr-only">Latest AI Blogs, News & Tutorials (2026)</h1>

      {/* Featured article - cinematic hero */}
      <Hero featuredPost={featuredPost} />

      {/* Top stories - 3 editorial picks */}
      <FeaturedStories latestPosts={topStories} />

      {/* All posts - article feed */}
      <LatestExplorations posts={allPosts} />

      {/* Curated collections - internal links so readers can browse a whole
          topic rather than a single article. Metadata only; the articles
          themselves are fetched on the collection page. */}
      <CollectionsSection collections={collections} />

      {/* Google Preferred Source section */}
      <GooglePreferredSourceSection />

      {/* Newsletter - minimal subscribe */}
      <Newsletter />
    </main>
  );
}
