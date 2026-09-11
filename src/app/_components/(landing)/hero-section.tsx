"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Post } from "./types";
import Link from "next/link";
import Image from "next/image";
import { usePostHog } from "posthog-js/react";

interface HeroProps {
  featuredPost?: Post;
  spotlightPost?: Post;
}

const Hero: React.FC<HeroProps> = ({ featuredPost }) => {
  const posthog = usePostHog();

  if (!featuredPost) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 lg:pt-16 lg:pb-20">
      {/* Featured label */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Featured
        </span>
      </div>

      <Link
        href={`/${featuredPost.slug}`}
        onClick={() => posthog.capture("blog_hero_clicked", { blog_slug: featuredPost.slug })}
        className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        prefetch={false}
      >
        {/* Left: Text content - 6 cols */}
        <div className="lg:col-span-6 flex flex-col gap-6 order-2 lg:order-1">
          <h2 className="text-3xl sm:text-4xl lg:text-4xl font-semibold tracking-tight text-foreground leading-[1.1]">
            {featuredPost.title}
          </h2>

          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed line-clamp-3 max-w-xl">
            {featuredPost.excerpt}
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {featuredPost.category || "Article"}
              </span>
              <span>{featuredPost.date}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{featuredPost.readTime || "5 min read"}</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-300 w-fit">
            Read more
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* Right: Image - 6 cols */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
            {featuredPost.imageUrl ? (
              <Image
                src={featuredPost.imageUrl}
                alt={featuredPost.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-muted" />
            )}
          </div>
        </div>
      </Link>
    </section>
  );
};

export default Hero;
