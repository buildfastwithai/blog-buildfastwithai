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
| `www.buildfastwithai.com/blogs/collection/x` | `blog.buildfastwithai.com/collection/x`     |

The main site keeps a permanent (308) redirect from `/blogs/*` to the matching
URL here, so existing backlinks keep working. This app also redirects
`/blogs/*` → `/*` in case a link is rewritten to the new host by hand.

## Stack

- Next.js 16 (App Router, ISR), React 19, Tailwind v4, shadcn/ui
- Supabase — same project and tables as the main site (`blogs`,
  `blogs_category`, `blogs_curated`, `blogs_subscriber`, …), read with the
  public publishable key. No auth, no sessions.
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
  disallow-all `robots.txt`. Set this on Vercel **preview** deployments, and on
  production until you are ready for the new domain to be indexed.
- `REVALIDATE_SECRET` — for `/api/revalidate/blog?slug=<slug>&secret=…`, which
  purges the ISR cache after publishing/editing a post.
- `LUMA_API_KEY` — the "next workshop" card in the article sidebar. Optional;
  the card falls back to a link to the workshops page.

## Routes

| Route                              | Cache                                |
| ---------------------------------- | ------------------------------------ |
| `/`                                | ISR, 1h                              |
| `/[slug]`                          | ISR, 24h; newest 50 pre-built        |
| `/all`, `/all/page/[page]`         | ISR, 1h                              |
| `/collection/[slug]` (+ `/page/N`) | ISR, 24h                             |
| `/sitemap.xml`, `/feed.xml`        | 24h / 1h                             |
| `/api/blogs/list`                  | CDN-cached search/filter for `/all`  |
| `/api/blogs/subscribe`             | Newsletter signup (rate-limited)     |
| `/api/events`                      | Luma calendar proxy (6h cache)       |
| `/api/revalidate/blog`             | On-demand ISR purge (secret-gated)   |

## What changed vs. the main-site version

- All links to programs and tools (`/agentic-ai`, `/claude`, `/tools/*`, …)
  are absolute URLs to `www.buildfastwithai.com` — see `src/lib/urls.ts`.
- "Join waitlist" buttons that opened a modal on the main site now link to
  the corresponding program page there.
- **Comments are not included.** They depend on the main site's login session,
  which is not shared with this subdomain. Reintroducing them requires
  cross-subdomain auth cookies (`Domain=.buildfastwithai.com`) on both apps.

## Deploy (Vercel)

1. Import this repo as a new Vercel project (framework: Next.js, package
   manager: pnpm).
2. Add the environment variables above. For **Preview** set
   `NEXT_PUBLIC_NOINDEX=true`.
3. Add the domain `blog.buildfastwithai.com` and create the CNAME it asks for.
4. Deploy, then confirm `https://blog.buildfastwithai.com/<any-slug>` renders.
5. Only after that, ship the main-site redirect (`/blogs/:path*` →
   `https://blog.buildfastwithai.com/:path*`) so backlinks land on a working
   page.
