# Build Fast with AI — Blog

The blog for [buildfastwithai.com](https://www.buildfastwithai.com), served on
its own subdomain: **blog.buildfastwithai.com**.

Ported from the `/blogs` section of the main site repo (`buildfastwithai`),
with the `/blogs` prefix dropped: every article now lives at the root.

| Old URL (main site)                          | New URL (this app)                          |
| -------------------------------------------- | ------------------------------------------- |
| `www.buildfastwithai.com/blogs`              | `blog.buildfastwithai.com/`                 |
| `www.buildfastwithai.com/blogs/<slug>`       | `blog.buildfastwithai.com/<slug>`           |
| `www.buildfastwithai.com/blogs/all`          | `blog.buildfastwithai.com/all`              |
| `www.buildfastwithai.com/blogs/all/page/N`   | `blog.buildfastwithai.com/all/page/N`       |
| `www.buildfastwithai.com/blogs/collection/x` | `blog.buildfastwithai.com/x`                |

The main site keeps permanent (308) redirects from `/blogs/*` (and
`/blogs/collection/*`) to the matching URL here, so existing backlinks keep
working. This app also redirects `/blogs/*` and `/collection/*` → `/*` in case
a link is rewritten to the new host by hand.

Articles and collections share the root: `/[slug]` tries an article first,
then a curated collection. Keep collection slugs distinct from article slugs.

## Stack

- Next.js 16 (App Router, ISR), React 19, Tailwind v4, shadcn/ui
- Supabase — same project and tables as the main site (`blogs`,
  `blogs_category`, `blogs_curated`, `blogs_subscriber`, `blogs_comments`,
  `users`, `login_tracking`, …). Same auth users: an account created on the
  main site signs in here with the same credentials.
- PostHog + GA + GTM + Meta Pixel with the same IDs as the main site.

## Local development

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are the
only variables the site cannot run without.

## Environment

See [`.env.example`](.env.example). Notable:

- `NEXT_PUBLIC_SITE_URL` — public origin of the deployment. Drives canonicals,
  sitemap, RSS and JSON-LD. Defaults to `https://blog.buildfastwithai.com`.
- `NEXT_PUBLIC_NOINDEX=true` — emits `noindex` on every page and a
  disallow-all `robots.txt`. Non-production stages force it on; set it on
  production until you are ready for the new domain to be indexed.
- `REVALIDATE_SECRET` — for `/api/revalidate/blog?slug=<slug>&secret=…`, which
  purges the ISR cache after publishing/editing a post.
- `LUMA_API_KEY` — the "next workshop" card in the article sidebar. Optional;
  the card falls back to a link to the workshops page.

## Routes

| Route                              | Cache                                |
| ---------------------------------- | ------------------------------------ |
| `/`                                | ISR, 1h                              |
| `/[slug]`                          | Article or collection; ISR 24h       |
| `/all`, `/all/page/[page]`         | ISR, 1h                              |
| `/[slug]/page/[page]`              | Collection pagination; ISR 24h       |
| `/sitemap.xml`, `/feed.xml`        | 24h / 1h                             |
| `/api/blogs/list`                  | CDN-cached search/filter for `/all`  |
| `/api/blogs/subscribe`             | Newsletter signup (rate-limited)     |
| `/api/events`                      | Luma calendar proxy (6h cache)       |
| `/api/revalidate/blog`             | On-demand ISR purge (secret-gated)   |
| `/auth/callback`                   | Google OAuth code exchange           |
| `/auth/confirm`                    | Email confirmation link landing      |
| `/auth/reset`                      | Set a new password (from reset mail) |

## What changed vs. the main-site version

- All links to programs and tools (`/agentic-ai`, `/claude`, `/tools/*`, …)
  are absolute URLs to `www.buildfastwithai.com` — see `src/lib/urls.ts`.
- "Join waitlist" buttons that opened a modal on the main site now link to
  the corresponding program page there.
- **Comments and sign-in work the same way as on the main site** — same login
  dialog (Google, or email → password / create account, forgot password),
  same `blogs_comments` table, same Slack + reply-email notifications. The
  session lives in cookies for this domain, so a reader signs in here once,
  independently of the main site. The main site's anonymous-session data
  transfers (resume analyses, course enrollments, …) are not part of the
  blog and were left out.

## Supabase configuration (one-time)

Supabase only redirects back to URLs on its allow-list. In the Supabase
dashboard → **Authentication → URL Configuration → Redirect URLs**, add:

```
https://blog.buildfastwithai.com/**
http://localhost:3000/**        (or whichever port you use locally)
```

Without this, Google sign-in and email confirmation links bounce back to the
main site instead of the blog. Google OAuth itself needs no change — the
provider is configured at the Supabase project level.

## Deploy (AWS CloudFront)

The site runs on AWS behind CloudFront, built with [OpenNext](https://opennext.js.org/aws)
and provisioned by [SST](https://sst.dev) (`sst.config.ts`):

```
blog.buildfastwithai.com
  └─ CloudFront ── static assets ──▶ S3
                ── /_next/image ───▶ Lambda (image optimizer)
                ── everything else ▶ Lambda (Next.js server: SSR, ISR, API routes, proxy.ts)
                                       └─ ISR cache: S3 + DynamoDB, revalidation via SQS → Lambda
```

Deploys are done by GitHub Actions (`.github/workflows/deploy.yml`):

- **push to `main`** → `sst deploy --stage production` (the live site)
- **Run workflow** (manual) → any other stage, e.g. `staging`, on its own
  CloudFront URL with `noindex` forced on. Use this to preview before merging.
- `.github/workflows/ci.yml` runs lint, typecheck and a `next build` on PRs.

Every stage is an isolated set of AWS resources; production resources are
`protect`ed and retained on removal.

### One-time setup

1. **AWS deploy role for GitHub (OIDC, no access keys).** With admin
   credentials for the AWS account:

   ```bash
   aws cloudformation deploy --region ap-south-1 \
     --stack-name blog-github-deploy \
     --template-file infra/github-oidc.cfn.yml \
     --capabilities CAPABILITY_NAMED_IAM
   aws cloudformation describe-stacks --stack-name blog-github-deploy \
     --query "Stacks[0].Outputs[?OutputKey=='DeployRoleArn'].OutputValue" --output text
   ```

   If the account already has the `token.actions.githubusercontent.com`
   provider, add `--parameter-overrides CreateOidcProvider=false`.

2. **TLS certificate for the subdomain.** `buildfastwithai.com`'s DNS is on
   Google Cloud DNS, not Route53, so the certificate is created by hand.
   CloudFront requires it in **us-east-1** regardless of the deploy region:

   ```bash
   aws acm request-certificate --region us-east-1 \
     --domain-name blog.buildfastwithai.com --validation-method DNS
   aws acm describe-certificate --region us-east-1 --certificate-arn <arn> \
     --query "Certificate.DomainValidationOptions[0].ResourceRecord"
   ```

   Add the returned validation CNAME in Google Cloud DNS and wait for the
   certificate status to become `ISSUED`. Keep the ARN.

   _Alternative:_ delegate the `blog` subdomain to Route53 (create a hosted
   zone `blog.buildfastwithai.com`, add its four NS records in Google Cloud
   DNS) and skip this step and step 5 — SST issues the certificate and creates
   the alias record itself when `BLOG_ACM_CERT_ARN` is unset.

3. **GitHub environments.** In the repo → Settings → Environments create
   `production` and `staging`. (Optionally add required reviewers on
   `production`.) The OIDC trust policy only allows jobs running inside an
   environment of this repo.

   Secrets (per environment, or repository-wide):

   | Secret                                 | Notes                                   |
   | -------------------------------------- | --------------------------------------- |
   | `AWS_DEPLOY_ROLE_ARN`                  | From step 1                             |
   | `BLOG_ACM_CERT_ARN`                    | From step 2 (production only)           |
   | `NEXT_PUBLIC_SUPABASE_URL`             | required                                |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | required (also used by CI's build)      |
   | `SUPABASE_SECRET_KEY`                  |                                         |
   | `NEXT_PUBLIC_POSTHOG_KEY`              |                                         |
   | `BLOG_SLACK_WEBHOOK_URL` / `SLACK_WEBHOOK_URL` |                                 |
   | `RESEND_API_KEY`                       |                                         |
   | `LUMA_API_KEY`                         |                                         |
   | `REVALIDATE_SECRET`                    |                                         |

   Variables (optional): `AWS_REGION` (default `ap-south-1`; pick the region
   nearest the Supabase project), `NEXT_PUBLIC_SITE_URL`,
   `NEXT_PUBLIC_NOINDEX` (production only — set `true` until the domain is
   ready to be indexed), `BLOG_PREBUILD_COUNT`.

4. **First deploy.** Push to `main` (or run the Deploy workflow with stage
   `production`). SST creates its state bucket on the first run. The job
   summary shows the site URL; the `cloudfrontUrl` output in the log is the
   `d….cloudfront.net` host.

5. **DNS.** In Google Cloud DNS add
   `blog.buildfastwithai.com  CNAME  <d….cloudfront.net>`. Confirm
   `https://blog.buildfastwithai.com/<any-slug>` renders.

6. Only after that, ship the main-site redirect (`/blogs/:path*` →
   `https://blog.buildfastwithai.com/:path*`) so backlinks land on a working
   page, and flip `NEXT_PUBLIC_NOINDEX` off.

### Deploying from a laptop

Useful for a personal stage while iterating on infrastructure:

```bash
export AWS_PROFILE=…            # or any credentials with the same permissions as the deploy role
set -a; source .env.local; set +a
pnpm deploy:staging             # or: pnpm sst deploy --stage <your-name>
pnpm sst remove --stage <your-name>   # tear it down afterwards
```

`pnpm sst dev` runs the app locally against the stage's AWS resources.

### Cache purging

`/api/revalidate/blog?slug=…&secret=…` works as before — `revalidatePath()`
goes through OpenNext's revalidation queue and updates the ISR cache in S3;
CloudFront honours the resulting cache headers. There is no need to invalidate
CloudFront by hand after publishing a post.
