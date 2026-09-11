"use client";

import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { Apple, Download, Play, Star } from "lucide-react";

/**
 * Layout: "app store card" (icon, rating, install row).
 * Palette: near-black shell + electric lime (--cta-unrot-*).
 *
 * Unrot is our own product but lives on its own domain, so this is the one CTA
 * that leaves buildfastwithai.com.
 */

export default function UnrotCta() {
  const posthog = usePostHog();

  return (
    <aside className="not-prose group relative my-8 overflow-hidden rounded-[20px] border border-[var(--cta-unrot-border)] bg-[linear-gradient(145deg,var(--cta-unrot-bg)_0%,var(--cta-unrot-bg-2)_100%)] shadow-[var(--shadow-xl)]">
      <div
        aria-hidden
        className="cta-dots pointer-events-none absolute inset-0 text-[color-mix(in_oklab,var(--cta-unrot-accent)_18%,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[color-mix(in_oklab,var(--cta-unrot-accent)_30%,transparent)] blur-[90px]"
      />

      <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center">
        {/* App identity */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="flex h-14 w-14 overflow-hidden shrink-0 items-center justify-center rounded-[18px] bg-[var(--cta-unrot-accent)] shadow-[0_10px_28px_color-mix(in_oklab,var(--cta-unrot-accent)_35%,transparent)]">
            <img src="https://app.unrot.co/assets/assets/images/splash-icon.fe63d99b14314caec8b81ae2724ba340.png" alt="Unrot Logo" className="h-full w-full object-cover" />
          </span>

          <div className="min-w-0">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cta-unrot-accent)]">
              5 min AI learning app
            </p>
            <h3 className="mb-0 mt-1.5 text-[19px] font-bold leading-tight tracking-tight text-[var(--cta-unrot-ink)] sm:text-[21px]">
              Unrot: AI in 5 minutes a day
            </h3>
            <p className="mb-0 mt-1.5 text-[13px] leading-relaxed text-[var(--cta-unrot-muted)]">
              Swap the doomscroll for one sharp lesson.
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="inline-flex items-center gap-0.5" aria-label="Rated 4.8 out of 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-[var(--cta-unrot-accent)] text-[var(--cta-unrot-accent)]"
                  />
                ))}
              </span>
              <span className="text-[11px] font-semibold text-[var(--cta-unrot-ink)]">
                4.8
              </span>
              <span className="text-[11px] font-medium text-[var(--cta-unrot-muted)]">
                Free, no ads
              </span>
            </div>
          </div>
        </div>

        {/* Install */}
        <div className="flex shrink-0 flex-col gap-2 md:w-[190px]">
          <Link
            href="https://www.unrot.co?utm_source=blog_cta&utm_medium=inline&utm_campaign=unrot_app"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => posthog?.capture("blog_cta_unrot_click")}
            className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--cta-unrot-accent)] px-6 py-3 text-sm font-bold text-[var(--cta-unrot-bg)] shadow-[0_8px_22px_color-mix(in_oklab,var(--cta-unrot-accent)_30%,transparent)] transition-all duration-200 hover:bg-[var(--cta-unrot-accent-strong)]"
          >
            <span aria-hidden className="cta-sheen pointer-events-none absolute inset-0" />
            <Download className="relative h-4 w-4" />
            <span className="relative">Get the app</span>
          </Link>
          <div className="flex items-center justify-center gap-3 text-[var(--cta-unrot-muted)]">
            <Apple className="h-4 w-4" aria-label="iOS" />
            <Play className="h-4 w-4" aria-label="Android" />
            <span className="text-[10px] font-medium">unrot.co</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
