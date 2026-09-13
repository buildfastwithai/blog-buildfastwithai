"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import type { BlogCuratedMeta } from "@/actions/blog.actions";

interface CollectionsSectionProps {
  collections: BlogCuratedMeta[];
}

const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  collections = [],
}) => {
  const posthog = usePostHog();

  if (collections.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
      <div className="border-t border-border pt-10 lg:pt-12">
        {/* Section header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              <Layers className="w-3.5 h-3.5" />
              Browse by topic
            </p>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
              Collections
            </h2>
          </div>
          <Link
            href="/all"
            onClick={() =>
              posthog.capture("blog_view_all_clicked", {
                location: "collections_section",
              })
            }
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 whitespace-nowrap"
          >
            All articles
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Collection tiles — internal links to every curated collection */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/${collection.slug || collection.id}`}
              prefetch={false}
              onClick={() =>
                posthog.capture("blog_collection_clicked", {
                  collection_name: collection.name,
                  collection_slug: collection.slug,
                  location: "blogs_landing",
                })
              }
              className="group flex flex-col rounded-xl border border-border overflow-hidden bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
            >
              <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                {collection.image_url ? (
                  <Image
                    src={collection.image_url}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 p-4">
                <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                  {collection.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {collection.articles_count} article
                  {collection.articles_count !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
