"use client";

import React from "react";
import { Post } from "./types";
import Link from "next/link";
import Image from "next/image";

interface FeaturedStoriesProps {
  latestPosts?: Post[];
}

const FeaturedStories: React.FC<FeaturedStoriesProps> = ({
  latestPosts = [],
}) => {
  if (latestPosts.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
      {/* Subtle divider */}
      <div className="border-t border-border mb-10 lg:mb-12" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {latestPosts.map((post) => (
          <Link
            key={post.id}
            href={`/${post.slug || post.id}`}
            className="group flex flex-col"
            prefetch={false}
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
    </section>
  );
};

export default FeaturedStories;
