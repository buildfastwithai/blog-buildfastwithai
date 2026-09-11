"use client";

import Image from "next/image";
import Link from "next/link";
import type { BlogCardData } from "@/actions/blog.actions";
import { format } from "date-fns";
import { usePostHog } from "posthog-js/react";

interface BlogCardProps {
  blog: BlogCardData;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const posthog = usePostHog();

  return (
    <Link
      href={`/${blog.slug}`}
      className="group flex flex-col"
      prefetch={false}
      onClick={() => {
        posthog.capture("blog_card_clicked", {
          blog_title: blog.title,
          blog_slug: blog.slug,
          category: blog.categories?.[0]?.name,
          location: "all_blogs_page",
        });
      }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-muted">
        {blog.image_url ? (
          <Image
            src={blog.image_url}
            alt={blog.title || "Blog cover"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Category badge */}
      <span className="inline-block w-fit px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground mb-3">
        {blog.categories?.[0]?.name || "Article"}
      </span>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {blog.title}
      </h3>

      {/* Meta */}
      <p className="text-sm text-muted-foreground mt-auto">
        {format(new Date(blog.created_at), "MMMM dd, yyyy")}
      </p>
    </Link>
  );
}
