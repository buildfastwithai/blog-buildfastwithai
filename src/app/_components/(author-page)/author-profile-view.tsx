import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Linkedin, Twitter, Github, Globe, CheckCircle2 } from "lucide-react";
import type { BlogsPage } from "@/actions/blog.actions";
import type { Author } from "@/lib/author";
import BlogCard from "@/app/_components/(all-blogs)/blogs-cards";
import AiReadinessCtaFull from "@/components/cta-cards/ai-readiness-cta-full";
import ClaudeMasteryCtaFull from "@/components/cta-cards/claude-mastery-cta-full";

interface AuthorProfileViewProps {
  author: Author;
  blogsPage: BlogsPage;
  page: number;
}

export default function AuthorProfileView({
  author,
  blogsPage,
  page,
}: AuthorProfileViewProps) {
  const { blogs, total, totalPages } = blogsPage;
  const basePath = `/author/${author.slug}`;
  const avatarSrc = author.avatar || "/authors/satvik.png";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
      {/* Back to blogs */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to blogs
      </Link>

      {/* Author Profile Hero Card */}
      <section className="rounded-3xl border border-border bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-sm p-6 sm:p-10 mb-14 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8">
          {/* Avatar */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-primary/10 border-4 border-primary/20 shrink-0 shadow-md">
            <Image
              src={avatarSrc}
              alt={author.name}
              fill
              sizes="112px"
              className="object-cover"
              priority
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Author
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                • {total} Published Article{total !== 1 ? "s" : ""}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-1">
              {author.name}
            </h1>

            <p className="text-sm sm:text-base font-medium text-primary mb-3">
              {author.role}
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl mb-5">
              {author.bio}
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2.5">
              {author.socials.linkedin && (
                <Link
                  href={author.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                  LinkedIn
                </Link>
              )}
              {author.socials.twitter && (
                <Link
                  href={author.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5 text-foreground" />
                  X / Twitter
                </Link>
              )}
              {author.socials.github && (
                <Link
                  href={author.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </Link>
              )}
              {author.socials.website && (
                <Link
                  href={author.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  Website
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Articles by {author.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Showing page {page} of {Math.max(1, totalPages)}
          </p>
        </div>
      </div>

      {/* Article Cards Grid */}
      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-16">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          No articles published yet.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Author pagination"
          className="flex items-center justify-center gap-1.5 mb-16"
        >
          {page > 1 && (
            <Link
              href={page === 2 ? basePath : `${basePath}/page/${page - 1}`}
              rel="prev"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
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
                href={n === 1 ? basePath : `${basePath}/page/${n}`}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {n}
              </Link>
            )
          )}

          {page < totalPages && (
            <Link
              href={`${basePath}/page/${page + 1}`}
              rel="next"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Next
            </Link>
          )}
        </nav>
      )}

      {/* CTAs */}
      <div className="max-w-5xl mx-auto mb-24 space-y-12">
        <AiReadinessCtaFull />
        <ClaudeMasteryCtaFull />
      </div>
    </div>
  );
}
