"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import BlogCard from "./blogs-cards";
import { Search, X } from "lucide-react";
import type {
  BlogCardData,
  BlogCategory,
  BlogsPage,
} from "@/actions/blog.actions";
import { cn } from "@/lib/utils";
import { usePostHog } from "posthog-js/react";

interface AllBlogsClientProps {
  /** Server-rendered first page for this route. Used as SWR fallback data. */
  initialPage: BlogsPage;
  categories: BlogCategory[];
  /** Base path for crawlable pagination links, e.g. "/all". */
  basePath?: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load blogs");
    return res.json() as Promise<BlogsPage>;
  });

export default function AllBlogsClient({
  initialPage,
  categories,
  basePath = "/all",
}: AllBlogsClientProps) {
  const posthog = usePostHog();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.trim()) {
        posthog.capture("blog_search", { query: searchQuery.trim() });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, posthog]);

  const isFiltering = selectedCategoryId !== null || debouncedQuery.trim() !== "";

  // Only fetch when a filter is active. With no filter we render the server's
  // statically-generated page and make zero requests.
  const key = useMemo(() => {
    if (!isFiltering) return null;
    const params = new URLSearchParams({ page: "1" });
    if (selectedCategoryId) params.set("category", String(selectedCategoryId));
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    return `/api/blogs/list?${params.toString()}`;
  }, [isFiltering, selectedCategoryId, debouncedQuery]);

  const { data, isLoading } = useSWR<BlogsPage>(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const view: BlogsPage = isFiltering ? (data ?? initialPage) : initialPage;
  const blogs: BlogCardData[] = isFiltering ? (data?.blogs ?? []) : view.blogs;
  const showSkeleton = isFiltering && isLoading && !data;

  const handleCategoryClick = (categoryId: number | null) => {
    const name = categories.find((c) => c.id === categoryId)?.name ?? "All posts";
    posthog.capture("blog_category_filter_clicked", {
      category_name: name,
      category_id: categoryId,
    });
    setSelectedCategoryId(categoryId);
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSearchQuery("");
    setDebouncedQuery("");
  };

  return (
    <>
      {/* Filter bar */}
      <div className="sticky top-16 z-40 -mx-6 px-6 py-3 bg-background/90 backdrop-blur-sm border-b border-border mb-10">
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleCategoryClick(null)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                !selectedCategoryId
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              All posts
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  selectedCategoryId === category.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {category.name}
              </button>
            ))}
          </nav>

          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 pl-9 pr-8 py-1.5 rounded-md bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-12 min-h-[50vh]">
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] rounded-xl bg-muted mb-4" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No articles found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Try different keywords or clear your filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination.
          Real <a> links to statically generated pages, so crawlers can walk the
          whole archive and each page is its own cached ISR entry. Hidden while
          filtering, where results are client-fetched and not a crawl surface. */}
      {!isFiltering && view.totalPages > 1 && (
        <Pagination
          basePath={basePath}
          page={view.page}
          totalPages={view.totalPages}
        />
      )}

      {isFiltering && (
        <div className="flex justify-center mb-16">
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters and browse all articles
          </button>
        </div>
      )}
    </>
  );
}

function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  const href = (n: number) => (n === 1 ? basePath : `${basePath}/page/${n}`);

  // Compact window so a 20-page archive doesn't render 20 links.
  const windowed: number[] = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, Math.max(page + 2, 5));
  for (let i = start; i <= end; i++) windowed.push(i);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mb-16"
    >
      {page > 1 && (
        <Link
          href={href(page - 1)}
          rel="prev"
          className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Previous
        </Link>
      )}

      {start > 1 && (
        <>
          <Link
            href={href(1)}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            1
          </Link>
          <span className="px-1 text-sm text-muted-foreground">…</span>
        </>
      )}

      {windowed.map((n) =>
        n === page ? (
          <span
            key={n}
            aria-current="page"
            className="px-3 py-1.5 rounded-md text-sm font-semibold bg-muted text-foreground"
          >
            {n}
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {n}
          </Link>
        )
      )}

      {end < totalPages && (
        <>
          <span className="px-1 text-sm text-muted-foreground">…</span>
          <Link
            href={href(totalPages)}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages && (
        <Link
          href={href(page + 1)}
          rel="next"
          className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
