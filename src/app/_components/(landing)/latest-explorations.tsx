"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Post } from "./types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";

interface LatestExplorationsProps {
  posts: Post[];
}

const LatestExplorations: React.FC<LatestExplorationsProps> = ({
  posts = [],
}) => {
  const posthog = usePostHog();
  const [activeCategory, setActiveCategory] = useState("All");

  // Extract unique categories from posts
  const categories = useMemo(() => {
    const unique = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
    return ["All", ...unique];
  }, [posts]);

  // Filter posts by active category
  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const displayPosts = filteredPosts.slice(0, 9);

  if (posts.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-12">
      {/* Section header with category tabs */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
            All posts
          </h2>
          <Link
            href="/all"
            onClick={() => posthog.capture("blog_view_all_clicked", { location: "top_header" })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                posthog.capture("blog_category_filter_clicked", { category: cat });
                setActiveCategory(cat);
              }}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3-column card grid - same style as featured stories */}
      {displayPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {displayPosts.map((post) => (
            <Link
              key={post.id}
              href={`/${post.slug || post.id}`}
              className="group flex flex-col"
              prefetch={false}
              onClick={() => {
                posthog.capture("blog_card_clicked", {
                  blog_title: post.title,
                  blog_slug: post.slug,
                  category: post.category,
                });
              }}
            >
              {/* Image */}
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-muted">
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
              </div>

              {/* Category badge */}
              <span className="inline-block w-fit px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
                {post.category || "Article"}
              </span>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground leading-snug mb-2.5 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                {post.title}
              </h3>

              {/* Meta */}
              <p className="text-sm text-muted-foreground mt-auto">
                {post.date}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No posts in this category yet.
        </p>
      )}

      {/* Next page link */}
      <div className="flex justify-end mt-8 pt-5 border-t border-border">
        <Link
          href="/all"
          onClick={() => posthog.capture("blog_next_page_clicked", { location: "latest_explorations_bottom" })}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          Next page
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};

export default LatestExplorations;
