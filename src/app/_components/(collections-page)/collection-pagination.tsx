import Link from "next/link";

/**
 * Server-rendered pagination for collection pages. Plain <a> links to statically
 * generated pages, so crawlers can reach every article in a collection instead
 * of only the first 12.
 */
export default function CollectionPagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  const href = (n: number) => (n === 1 ? basePath : `${basePath}/page/${n}`);

  const windowed: number[] = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, Math.max(page + 2, 5));
  for (let i = start; i <= end; i++) windowed.push(i);

  const linkClass =
    "px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors";

  return (
    <nav
      aria-label="Collection pagination"
      className="flex items-center justify-center gap-1.5"
    >
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      )}

      {start > 1 && (
        <>
          <Link href={href(1)} className={linkClass}>
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
          <Link key={n} href={href(n)} className={linkClass}>
            {n}
          </Link>
        )
      )}

      {end < totalPages && (
        <>
          <span className="px-1 text-sm text-muted-foreground">…</span>
          <Link href={href(totalPages)} className={linkClass}>
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages && (
        <Link href={href(page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      )}
    </nav>
  );
}
