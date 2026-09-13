"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { usePostHog } from "posthog-js/react";

interface BlogHeaderProps {
  title: string;
  createdAt: string;
  readingTime: number;
  categories?: { id: number; name: string }[];

  shareSlot?: React.ReactNode;
}

export function BlogHeader({
  title,
  createdAt,
  readingTime,
  categories,
  shareSlot,
}: BlogHeaderProps) {
  const posthog = usePostHog();

  return (
    <header className="flex flex-col items-start mb-8">
      {/* Back Link */}
      <Link
        href="/"
        onClick={() => posthog.capture("blog_back_to_blogs_clicked")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to blogs</span>
      </Link>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-md"
            >
              {category.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 id="blog-title" className="text-3xl md:text-5xl lg:text-5xl font-semibold tracking-tight text-foreground mb-6 leading-tight">
        {title}
      </h1>

     
      <div
        id="blog-meta-bar"
        className="flex flex-wrap items-center justify-between gap-y-3 w-full mb-4"
      >
        {/* Left: date + reading time */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* Right: inline share buttons (only shown on xl, hides when pill activates) */}
        {shareSlot && (
          <div className="hidden xl:flex items-center">{shareSlot}</div>
        )}
      </div>
    </header>
  );
}
