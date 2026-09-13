"use client";

import { useState, useEffect, useRef } from "react";
import { BlogHeader } from "./blog-header";
import { BlogContent } from "./blog-content";
import { ShareButtons } from "./share-buttons";
import { TableOfContents } from "./table-of-contents";
import { BlogRightSidebar } from "./blog-right-sidebar";
import { GooglePreferredSourceBtn } from "../google-preferred-source-btn";
import Image from "next/image";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { usePostHog } from "posthog-js/react";
import { 
  Smartphone, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  X,
  ExternalLink,
  Calendar,
  LayoutList
} from "lucide-react";
import Link from "next/link";

// Lazy load heavy components
const YouMightAlsoLike = dynamic(() => import("./you-may-be-like"), {
  loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />,
});






const NewsletterCTA = dynamic(() => import("../news-letter-cta"), {
  ssr: false,
});

const BlogComments = dynamic(
  () => import("./blog-comments").then((m) => m.BlogComments),
  { ssr: false }
);

interface BlogLayoutProps {
  blog: any;
  relatedBlogs: any[];
}

export function BlogLayout({ blog, relatedBlogs }: BlogLayoutProps) {
  const [tocItems, setTocItems] = useState<any[]>([]);
  const [activeCtas, setActiveCtas] = useState<string[]>([]);
  const [pillVisible, setPillVisible] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const posthog = usePostHog();
  const hasTrackedComplete = useRef(false);

  // Calculate reading time
  const wordsPerMinute = 200;
  const wordCount = blog.content?.split(/\s+/)?.length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  useEffect(() => {
    const trigger = document.getElementById("share-trigger");
    if (!trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setPillVisible(true);
        } else {
          setPillVisible(false);
        }
      },
      { threshold: 0 }
    );

    observer.observe(trigger);

    // Initial check
    const rect = trigger.getBoundingClientRect();
    if (rect.top < 0) {
      setPillVisible(true);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const endTrigger = document.getElementById("article-end-trigger");
    if (!endTrigger || hasTrackedComplete.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedComplete.current) {
          hasTrackedComplete.current = true;
          posthog.capture("blog_reading_completed", {
            blog_title: blog.title,
            blog_id: blog.id,
            reading_time_estimate: readingTime,
          });
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(endTrigger);
    return () => observer.disconnect();
  }, [blog.title, blog.id, readingTime, posthog]);

  return (
    <div className="w-full">
      {/* Reading column — max-w-2xl ≈ 68ch optimal prose width */}
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-0 py-10 lg:py-14">
        
        {/* ── Left Sidebar: Floating TOC (XL+) ────────────────────────── */}
        {tocItems.length > 0 && (
          <div className={cn(
            "hidden xl:block absolute -left-[340px] top-14 h-full pointer-events-none transition-all duration-700 ease-out",
            pillVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            <div className={cn(
              "sticky top-24 w-[300px]",
              pillVisible ? "pointer-events-auto" : "pointer-events-none"
            )}>
              <div className={cn(
                "overflow-hidden transition-all duration-500",
                tocOpen ? "max-h-[80vh]" : "max-h-[52px]"
              )}>
                <button
                  onClick={() => {
                    setTocOpen(!tocOpen);
                    posthog.capture("blog_toc_toggled", { state: !tocOpen ? "opened" : "closed" });
                  }}
                  className="flex items-center justify-between w-full py-4 text-foreground transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-7 rounded-full bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                      </svg>
                    </div>
                    <span className="text-[13px] font-bold text-foreground tracking-tight">
                      Table of Contents
                    </span>
                  </span>
                  {tocOpen ? <ChevronLeft className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                </button>
                
                <div className={cn(
                  "px-5 pb-6 pt-2 overflow-y-auto max-h-[calc(80vh-60px)] transition-opacity duration-300",
                  tocOpen ? "opacity-100" : "opacity-0 pointer-events-none h-0"
                )}>
                  <TableOfContents items={tocItems} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Right Sidebar: Floating CTAs (XL+) ──────────────────────── */}
        <BlogRightSidebar isVisible={pillVisible} activeCtas={activeCtas} />


        <div
          className="hidden xl:block absolute -right-16 bottom-0 h-full pointer-events-none"
          aria-hidden={!pillVisible}
        >
          <div className="sticky top-[calc(100vh-16rem)] pointer-events-auto">
            <div
              className={cn(
                "transition-all duration-300 ease-in-out",
                pillVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2 pointer-events-none"
              )}
            >
              <ShareButtons title={blog.title} variant="floating" />
            </div>
          </div>
        </div>

        {/* ── Blog Header (with inline share slot on xl) ───────────────── */}
        <BlogHeader
          title={blog.title}
          createdAt={blog.created_at}
          readingTime={readingTime}
          categories={blog.categories}
          shareSlot={<ShareButtons title={blog.title} variant="inline" />}
        />

        {/* ── Featured Image (Wider than content) ─────────────────────── */}
        <div className="relative w-full lg:w-[calc(100%+16rem)] lg:-mx-32 aspect-[16/9] rounded-2xl overflow-hidden shadow-md bg-muted mb-12">
          {blog.image_url ? (
            <Image
              src={blog.image_url}
              alt={blog.title ?? "Blog cover"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-muted-foreground"
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="opacity-30"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>


        {/* ── Mobile share bar (below TOC / image on smaller screens) ──── */}
        <div className="xl:hidden flex items-center gap-2 mb-8 pb-4 border-b border-border">
          <ShareButtons title={blog.title} variant="inline" />
        </div>

        {/* ── Trigger element for floating share button ─────────────────── */}
        <div id="share-trigger" className="w-full h-px -mt-px opacity-0 pointer-events-none" aria-hidden="true" />

        {/* ── Main Article Content ──────────────────────────────────────── */}
        <main>
          <BlogContent content={blog.content} blogTitle={blog.title} onHeadingsChange={setTocItems} onActiveCtasChange={setActiveCtas} />
        </main>

        {/* ── Post-article divider ──────────────────────────────────────── */}
        <div id="article-end-trigger" className="mt-14 mb-12 border-t border-border" />

        {/* ── Bottom share bar (below article) ─────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-14 w-full">
          <div className="flex items-center min-w-[245px] min-h-[44px] rounded-full overflow-hidden shrink-0">
            <GooglePreferredSourceBtn />
          </div>
          <div className="flex items-center justify-end shrink-0">
            <ShareButtons title={blog.title} variant="inline" />
          </div>
        </div>



        {/* ── Comments ─────────────────────────────────────────────────── */}
        <section id="blog-comments" className="mb-14 scroll-mt-24">
          <BlogComments blogId={blog.id} />
        </section>

        {/* ── Newsletter CTA ───────────────────────────────────────────── */}
        <div className="mb-14">
          <NewsletterCTA />
        </div>

        {/* ── You Might Also Like ──────────────────────────────────────── */}
        <div className="mb-14">
          <YouMightAlsoLike
            blogs={relatedBlogs}
            currentBlogId={blog.id}
            currentBlogCategories={blog.categories}
          />
        </div>

      </div>
    </div>
  );
}
