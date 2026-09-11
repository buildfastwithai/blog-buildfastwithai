import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Article Not Found",
  robots: { index: false, follow: false },
};

/**
 * Blog-scoped 404. Keeps the reader inside the blog shell with real routes to
 * continue from, instead of dumping them on the site-wide 404.
 *
 * `notFound()` sets the HTTP status to 404 — verify this in a production build
 * (the dev server reports 200 for not-found responses).
 */
export default function BlogNotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <div className="text-center max-w-md">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          404
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-3">
          This article doesn&apos;t exist
        </h1>
        <p className="text-muted-foreground mb-8">
          The link may be broken, or the post may have been moved or removed.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Latest articles
          </Link>
          <Link
            href="/all"
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Browse all articles
          </Link>
        </div>
      </div>
    </div>
  );
}
