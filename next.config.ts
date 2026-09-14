import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Blog cover images are Supabase-hosted and immutable once published, so a
    // short TTL just pays for the same transformation over and over.
    minimumCacheTTL: 2678400, // 31 days
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "oukdqujzonxvqhiefdsv.supabase.co" },
      { protocol: "https", hostname: "auth.buildfastwithai.com" },
      { protocol: "https", hostname: "www.buildfastwithai.com" },
      { protocol: "https", hostname: "images.lumacdn.com" },
    ],
  },
  // PostHog reverse proxy: route analytics/replay traffic through our own
  // domain so ad blockers don't block the recorder/assets. Keep the static
  // and array rules before the catch-all. See src/providers/posthog.tsx.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Required so PostHog's trailing-slash API requests aren't redirected.
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        // Responses here carry a user's session cookies. They are dynamic
        // already, but make it explicit so no CDN or proxy ever stores one.
        source: "/auth/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Anyone who lands here with the old main-site path shape (e.g. a link
      // rewritten by hand to the new host but keeping /blogs/) still gets the
      // article instead of a 404.
      // Order matters: first match wins, so the more specific rules go first.
      // Both prefixes at once (an old URL rewritten to the new host by hand).
      {
        source: "/blogs/collection/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/blogs",
        destination: "/",
        permanent: true,
      },
      {
        source: "/blogs/:path*",
        destination: "/:path*",
        permanent: true,
      },
      // Collections dropped the /collection/ prefix; they live at /<slug> now.
      {
        source: "/collection/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

export default config;
