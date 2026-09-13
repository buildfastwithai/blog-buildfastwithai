/// <reference path="./.sst/platform/config.d.ts" />

/**
 * AWS deployment for blog.buildfastwithai.com.
 *
 * SST builds the app with OpenNext and provisions:
 *   CloudFront (CDN + custom domain) → Lambda (Next.js server, image
 *   optimizer) + S3 (static assets, ISR cache) + SQS/DynamoDB (ISR
 *   revalidation queue + tag cache).
 *
 * Stages:
 *   production — deployed from `main` by .github/workflows/deploy.yml, gets
 *                the custom domain and is indexable.
 *   anything else (staging, a developer's `sst dev` stage) — CloudFront URL
 *                only, NEXT_PUBLIC_NOINDEX=true.
 *
 * All configuration comes from process.env: GitHub Actions secrets/variables
 * in CI, or your shell when running `pnpm deploy:staging` locally. See README
 * → "Deploy (AWS CloudFront)".
 */

const PRODUCTION_DOMAIN = "blog.buildfastwithai.com";
const DEFAULT_SITE_URL = `https://${PRODUCTION_DOMAIN}`;

// Values the site cannot start without. Fail the deploy early rather than
// shipping a build that 500s on every request.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value ? value : undefined;
}

// Drop undefined entries so SST doesn't try to set "undefined" as a value.
function compact(env: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(env).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;
}

export default $config({
  app(input) {
    return {
      name: "blog-buildfastwithai",
      // Keep production resources (ISR cache bucket, CloudFront) if the
      // stack is ever removed; tear down ephemeral stages completely.
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      home: "aws",
      providers: {
        aws: {
          // Pick the region closest to the Supabase project — every SSR
          // request makes several Supabase round-trips.
          region: (process.env.AWS_REGION ?? "ap-south-1") as any,
        },
      },
    };
  },
  async run() {
    const isProduction = $app.stage === "production";

    // Custom domain. buildfastwithai.com's DNS lives outside Route53, so by
    // default we hand SST a pre-created ACM certificate (us-east-1) and add
    // the CNAME to CloudFront by hand — see README. If the `blog` subdomain
    // is ever delegated to a Route53 hosted zone, unset BLOG_ACM_CERT_ARN
    // and SST will issue the certificate and create the alias record itself.
    const certArn = optional("BLOG_ACM_CERT_ARN");
    const domain = isProduction
      ? certArn
        ? { name: PRODUCTION_DOMAIN, dns: false as const, cert: certArn }
        : { name: PRODUCTION_DOMAIN }
      : undefined;

    const siteUrl = isProduction
      ? (optional("NEXT_PUBLIC_SITE_URL") ?? DEFAULT_SITE_URL)
      : optional("NEXT_PUBLIC_SITE_URL");

    const site = new sst.aws.Nextjs("Blog", {
      // Pin OpenNext: SST's auto-detected default predates Next.js 16.
      openNextVersion: "4.1.5",
      domain,
      environment: compact({
        // Public (inlined into the client bundle at build time).
        NEXT_PUBLIC_SUPABASE_URL: required("NEXT_PUBLIC_SUPABASE_URL"),
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: required(
          "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        ),
        NEXT_PUBLIC_SITE_URL: siteUrl,
        // Non-production stages are never indexable, whatever the env says.
        NEXT_PUBLIC_NOINDEX: isProduction
          ? (optional("NEXT_PUBLIC_NOINDEX") ?? "false")
          : "true",
        NEXT_PUBLIC_POSTHOG_KEY: optional("NEXT_PUBLIC_POSTHOG_KEY"),
        // Server-only.
        SUPABASE_SECRET_KEY: optional("SUPABASE_SECRET_KEY"),
        BLOG_SLACK_WEBHOOK_URL: optional("BLOG_SLACK_WEBHOOK_URL"),
        SLACK_WEBHOOK_URL: optional("SLACK_WEBHOOK_URL"),
        RESEND_API_KEY: optional("RESEND_API_KEY"),
        LUMA_API_KEY: optional("LUMA_API_KEY"),
        REVALIDATE_SECRET: optional("REVALIDATE_SECRET"),
        BLOG_PREBUILD_COUNT: optional("BLOG_PREBUILD_COUNT"),
      }),
      server: {
        // arm64 is cheaper and the app has no native deps at runtime.
        architecture: "arm64",
        memory: "1536 MB",
        timeout: "30 seconds",
      },
      imageOptimization: {
        memory: "1536 MB",
        // Cover images are immutable once published (see minimumCacheTTL in
        // next.config.ts), so repeat requests can be answered with a 304.
        staticEtag: true,
      },
      // Keep one server instance warm in production so the first reader
      // after a quiet spell doesn't pay a cold start.
      warm: isProduction ? 1 : 0,
    });

    return {
      url: site.url,
      // Point the `blog` CNAME at this host when BLOG_ACM_CERT_ARN is used.
      cloudfrontUrl: site.nodes.cdn?.url,
    };
  },
});
