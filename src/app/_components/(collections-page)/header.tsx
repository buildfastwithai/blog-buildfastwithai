import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  title: string;
  description: string;
  articleCount: number;
  image_url: string;
  /** Current pagination page; appended to the H1 on page 2+. */
  page?: number;
}

export default function Header({
  title,
  description,
  articleCount,
  image_url,
  page = 1,
}: HeaderProps) {
  const isPaginated = page > 1;

  return (
    <div className={isPaginated ? "mb-8" : "mb-12"}>
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </Link>

      {/* Paginated pages use a compact header: no cover image and no
          description. Keeping the tall image next to a short text column left a
          large empty gap, and it also saved an image transformation per page. */}
      <div
        className={
          isPaginated
            ? ""
            : "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        }
      >
        {/* Text content */}
        <div className={isPaginated ? "" : "lg:col-span-2"}>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
              Collection
            </span>
            <span className="text-sm text-muted-foreground">
              {articleCount} article{articleCount !== 1 ? "s" : ""}
            </span>
            {isPaginated && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground">
                Page {page}
              </span>
            )}
          </div>

          <h1
            className={`font-bold tracking-tight text-foreground ${
              isPaginated
                ? "text-3xl lg:text-3xl mb-0"
                : "text-5xl lg:text-4xl mb-4"
            }`}
          >
            {title}
          </h1>

          {!isPaginated && description && (
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Image — page 1 only */}
        {!isPaginated && image_url && (
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>
        )}
      </div>
    </div>
  );
}
