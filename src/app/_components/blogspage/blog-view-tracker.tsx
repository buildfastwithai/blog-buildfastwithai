"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

/**
 * Records a blog read in PostHog.
 *
 * This used to POST to /api/blogs/[slug]/view, which cost one serverless
 * function invocation plus two Supabase round-trips on *every* pageview —
 * pinning invocation count to traffic no matter how well the page itself was
 * cached. It also did a read-then-write increment, so concurrent readers
 * overwrote each other and the stored counts were wrong anyway.
 *
 * PostHog is already loaded on these pages, so this is now a no-extra-request
 * capture and the numbers are actually correct.
 */
export function BlogViewTracker({
  slug,
  title,
  blogId,
}: {
  slug: string;
  title?: string | null;
  blogId?: number;
}) {
  const posthog = usePostHog();
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (!slug || tracked.current === slug) return;
    tracked.current = slug;

    posthog.capture("blog_viewed", {
      blog_slug: slug,
      blog_title: title ?? undefined,
      blog_id: blogId,
    });
  }, [slug, title, blogId, posthog]);

  return null;
}
