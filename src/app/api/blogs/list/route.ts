import { NextRequest, NextResponse } from "next/server";
import { BLOGS_PAGE_SIZE, getPublishedBlogsPage } from "@/actions/blog.actions";
import { getClientIp, rateLimit } from "@/lib/rate-limit";


export async function GET(request: NextRequest) {
  // Responses are CDN-cached, but a varying `q` busts the cache on every call —
  // so this endpoint can be used to hammer Postgres directly. Cap it.
  const limit = rateLimit({
    key: `blog-list:${getClientIp(request)}`,
    limit: 60,
    windowMs: 60 * 1000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  const { searchParams } = request.nextUrl;

  const page = Number(searchParams.get("page") ?? "1");
  const categoryParam = searchParams.get("category");
  const categoryId =
    categoryParam && Number.isFinite(Number(categoryParam))
      ? Number(categoryParam)
      : null;
  const query = searchParams.get("q") ?? "";

  try {
    const result = await getPublishedBlogsPage({
      page: Number.isFinite(page) ? page : 1,
      pageSize: BLOGS_PAGE_SIZE,
      categoryId,
      query,
    });

    return NextResponse.json(result, {
      headers: {
        // Same filter from many readers should not mean many origin renders.
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
        // Filtered permutations are not content we want indexed; the crawlable
        // surface is /all and /all/page/N.
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    console.error("Blog list API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
