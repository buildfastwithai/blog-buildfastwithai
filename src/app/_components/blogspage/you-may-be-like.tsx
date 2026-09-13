"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogCardData, BlogCategory } from "@/actions/blog.actions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";

interface YouMightAlsoLikeProps {
  blogs: BlogCardData[];
  currentBlogId: number;
  currentBlogCategories?: BlogCategory[];
}

export default function YouMightAlsoLike({
  blogs,
  currentBlogId,
  currentBlogCategories = [],
}: YouMightAlsoLikeProps) {
  const [startIndex, setStartIndex] = useState(0);

  const relatedBlogs = useMemo(() => {
    if (!currentBlogCategories || currentBlogCategories.length === 0) {
      return blogs.filter((blog) => blog.id !== currentBlogId);
    }

    const currentCategoryIds = currentBlogCategories.map((cat) => cat.id);

    return blogs.filter((blog) => {
      if (blog.id === currentBlogId) return false;
      if (!blog.categories || blog.categories.length === 0) return false;

      const blogCategoryIds = blog.categories.map((cat) => cat.id);
      return blogCategoryIds.some((id) => currentCategoryIds.includes(id));
    });
  }, [blogs, currentBlogId, currentBlogCategories]);

  if (relatedBlogs.length === 0) return null;

  const visibleBlogs = relatedBlogs.slice(startIndex, startIndex + 2);

  const handleNext = () => {
    if (startIndex + 2 < relatedBlogs.length) {
      setStartIndex(startIndex + 2);
    }
  };

  const handlePrev = () => {
    if (startIndex - 2 >= 0) {
      setStartIndex(startIndex - 2);
    }
  };

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <div className="text-xl font-bold text-foreground">
          You Might Also Like
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={startIndex === 0}
            className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleNext}
            disabled={startIndex + 2 >= relatedBlogs.length}
            className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleBlogs.map((blog) => (
          <MinimalBlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}

function MinimalBlogCard({ blog }: { blog: BlogCardData }) {
  const posthog = usePostHog();

  return (
    <Link
      href={`/${blog.slug}`}
      className="group flex flex-col"
      onClick={() => {
        posthog.capture("blog_card_clicked", {
          blog_title: blog.title,
          blog_slug: blog.slug,
          category: blog.categories?.[0]?.name,
          location: "related_blogs_section",
        });
      }}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-muted">
        {blog.image_url ? (
          <Image
            src={blog.image_url}
            alt={blog.title || "Blog image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
      </div>

      {/* Category */}
      <span className="inline-block w-fit px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground mb-2">
        {blog.categories?.[0]?.name || "Article"}
      </span>

      {/* Title */}
      <div className="text-base font-semibold text-foreground leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
        {blog.title}
      </div>

      {/* Excerpt */}
      {blog.excerpt && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {blog.excerpt}
        </p>
      )}
    </Link>
  );
}
