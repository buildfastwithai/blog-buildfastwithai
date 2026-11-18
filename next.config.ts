import type { NextConfig } from "next";
import { redirectsToMainSite } from "./src/lib/redirect-to-main-site";

const config: NextConfig = {
  // Next 16.3.0's Turbopack panics ("not a char boundary ... '─'") while it
  // prints a code frame for a browser warning whose source line holds a
  // box-drawing character, and `pnpm dev` exits. Don't forward browser logs to
  // the terminal; they still show in the browser console.
  logging: { browserToTerminal: false },
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
  // Required so trailing-slash URLs reach the redirects below unchanged.
  skipTrailingSlashRedirect: true,
  // This host is redirect-only: every URL 308s to its page on
  // www.buildfastwithai.com (see src/lib/redirect-to-main-site.ts). Redirects
  // run before any page, route handler or public file, so the app code below
  // them is never reached except for /robots.txt.
  async redirects() {
    return redirectsToMainSite();
  },
};

export default config;
