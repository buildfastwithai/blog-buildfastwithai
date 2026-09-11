import type { Metadata } from "next";
import { Inter, Space_Grotesk, Libre_Baskerville } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import MetaPixel from "@/components/meta-pixel";
import PostHogPageView from "@/components/analytics/posthog-pageview";
import { JsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { LoginForm } from "@/components/client-only-providers";
import { cn } from "@/lib/utils";
import { BLOG_SITE_URL } from "@/lib/urls";
import AuthProvider from "@/providers/auth-provider";
import CSPostHogProvider from "@/providers/posthog";
import QueryProvider from "@/providers/query-provider";
import { BlogThemeProvider } from "@/providers/theme-provider";
import { generateOrganizationSchema } from "@/utils/seo/json-ld";
import { generateBlogListingMetadata } from "@/utils/seo/metadata";
import NavbarBlog from "./_components/navbar-blog";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

// Same IDs as the main site so analytics stay in one property.
const GTM_ID = "GTM-KCM84S7V";
const GA_ID = "G-PYH3FFFZWL";
const META_PIXEL_IDS = ["1210269183379764", "668882032580699"];

// Set NEXT_PUBLIC_NOINDEX=true on preview/staging deployments so crawlers never
// index a non-production copy of the blog.
const NOINDEX = process.env.NEXT_PUBLIC_NOINDEX === "true";

const GTM_SNIPPET = [
  "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':",
  "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],",
  "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=",
  "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);",
  `})(window,document,'script','dataLayer','${GTM_ID}');`,
].join("\n");

export const metadata: Metadata = {
  ...generateBlogListingMetadata(),
  metadataBase: new URL(BLOG_SITE_URL),
  title: {
    default: "Build Fast with AI Blog",
    template: "%s",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon_package/android-chrome-512x512.png",
    apple: "/favicon_package/apple-touch-icon.png",
  },
  ...(NOINDEX ? { robots: { index: false, follow: false } } : {}),
};

// Caching is configured per page, not here. See each page's own `revalidate`.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link
          rel="preconnect"
          href="https://oukdqujzonxvqhiefdsv.supabase.co"
          crossOrigin="anonymous"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Build Fast with AI Blog"
          href="/feed.xml"
        />
        <JsonLd data={organizationSchema} />
      </head>
      <body
        className={cn(
          "min-h-screen",
          inter.className,
          spaceGrotesk.variable,
          libreBaskerville.variable,
        )}
      >
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: GTM_SNIPPET }}
        />
        <CSPostHogProvider>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
          {META_PIXEL_IDS.map((id) => (
            <MetaPixel key={id} pixelId={id} />
          ))}
          <PostHogPageView />
          {/* <main> must wrap the theme provider: next-themes renders an inline
              <script>, and if it lands as a direct child of <body>, posthog-js
              inserts its lazy-loaded scripts before it — inside the React tree —
              causing hydration mismatches on reload. */}
          <QueryProvider>
            <AuthProvider>
              <main className="relative flex min-h-screen flex-col">
                <BlogThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                  storageKey="blogs-theme"
                >
                  <div className="blogs-theme min-h-screen">
                    <NavbarBlog />
                    {children}
                    <Toaster />
                  </div>
                  {/* Sign-in dialog, opened from the comments section. Portals
                      to <body>; same component and flow as the main site. */}
                  <LoginForm />
                  <SonnerToaster />
                </BlogThemeProvider>
              </main>
            </AuthProvider>
          </QueryProvider>
          <GoogleAnalytics gaId={GA_ID} />
        </CSPostHogProvider>
      </body>
    </html>
  );
}
