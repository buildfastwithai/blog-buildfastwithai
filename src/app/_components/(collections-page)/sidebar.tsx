"use client";

import { mainSiteUrl } from "@/lib/urls";
import Link from "next/link";
import type { BlogCuratedMeta } from "@/actions/blog.actions";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import NewsletterSidebarCTA from "./newsletter-sidebar-cta";
import GenAiSidebarCTA from "./genai-sidebar-cta";
import { usePostHog } from "posthog-js/react";

interface SidebarProps {
  collections: BlogCuratedMeta[];
  currentCollectionId: number;
}

export default function Sidebar({
  collections,
  currentCollectionId,
}: SidebarProps) {
  const posthog = usePostHog();
  const recommendedCollections = collections
    .filter((c) => c.id !== currentCollectionId)
    .slice(0, 5);

  return (
    <div className="sticky top-32">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">Recommended</h3>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {recommendedCollections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collection/${collection.slug || collection.id}`}
            className="group flex items-center gap-3 py-3"
          >
            {/* Thumbnail */}
            {collection.image_url && (
              <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={collection.image_url}
                  alt={collection.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {collection.name}
              </h4>
              <span className="text-xs text-muted-foreground">
                {collection.articles_count} article
                {(collection.articles_count ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <GenAiSidebarCTA />

      {/* Claude Mastery Course Sidebar CTA */}
      <div className="mt-6">
        <Link
          href={mainSiteUrl("/claude?utm_source=blog_collection_sidebar")}
          onClick={() => posthog.capture("blog_collection_sidebar_claude_click")}
          className="block group overflow-hidden rounded-[20px] border border-border shadow-sm transition-all duration-300 bg-white"
        >
          <div className="w-full overflow-hidden">
            <img
              src="https://auth.buildfastwithai.com/storage/v1/object/public/claude-course/assets/claude-cta.png"
              alt="Claude Mastery Course"
              className="w-full h-auto"
            />
          </div>
        </Link>
      </div>

      <NewsletterSidebarCTA />
    </div>
  );
}
