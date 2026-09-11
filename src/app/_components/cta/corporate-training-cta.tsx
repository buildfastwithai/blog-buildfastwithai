"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";

/**
 * Layout: "statement slab" - an oversized headline with the brief and the pill
 * action laid OVER it, which is what keeps the card wide-and-short.
 * Palette: --cta-corp-*, light sand slab / dark slate slab, gold accent.
 *
 * Responsive: sized in `cqw` off the CARD width, never the viewport. The
 * overlay only applies once the card is at least 30rem wide; below that the
 * three blocks stack in normal flow. Stacked matters - overlaid at 343px the
 * brief ran into the button by ~29px. See `.cta-corp-*` in blogs.css.
 *
 * Overlay clearances at 11.1cqw / 0.84 leading, longest line 62.9cqw:
 *   line 1 left edge 34.9cqw vs brief  ending 31.5cqw -> clear
 *   line 3 left edge 43.6cqw vs button ending ~33cqw  -> clear
 */

const LINES = ["Let's make", "your team"];

export default function CorporateTrainingCta() {
  const posthog = usePostHog();

  return (
    <aside
      style={{ containerType: "inline-size" }}
      className="not-prose group relative my-8 overflow-hidden rounded-[20px] border border-[var(--cta-corp-border)] bg-[linear-gradient(150deg,var(--cta-corp-bg)_0%,var(--cta-corp-bg-2)_100%)] shadow-[var(--shadow-xl)]"
    >
      <span
        aria-hidden
        className="cta-grid pointer-events-none absolute inset-0 text-[color-mix(in_oklab,var(--cta-corp-ink)_7%,transparent)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-1/2 left-[40%] h-[220%] w-[38%] rotate-[24deg] bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklab,var(--cta-corp-accent)_30%,transparent)_46%,color-mix(in_oklab,var(--cta-corp-ink)_18%,transparent)_60%,transparent_100%)] blur-[40px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(200deg,transparent_28%,color-mix(in_oklab,var(--cta-corp-bg)_72%,transparent)_100%)]"
      />

      {/* DOM order is the mobile reading order. The container query lifts the
          brief and the action out of flow on wider cards. */}
      <div className="cta-corp-body relative z-10">
        <div className="cta-corp-brief z-20">
          <p className="m-0 flex items-start gap-2 text-[max(12px,1.85cqw)] font-bold leading-tight text-[var(--cta-corp-ink)]">
            <span className="mt-[0.45em] h-[0.42em] w-[0.42em] shrink-0 rounded-full bg-[var(--cta-corp-accent)]" />
            Ready to upskill your team?
          </p>
          <p className="m-0 mt-[0.5em] text-[max(11.5px,1.72cqw)] leading-snug text-[var(--cta-corp-muted)]">
            Tell us your stack and your goals. We build the programme around
            them.
          </p>
        </div>

        <h3 className="cta-corp-headline m-0 font-extrabold uppercase leading-[0.86] tracking-[-0.05em] text-[var(--cta-corp-ink)]">
          {LINES.map((line) => (
            <span key={line} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
          <span className="block whitespace-nowrap text-[var(--cta-corp-accent)]">
            AI-native
          </span>
        </h3>

        <Link
          href={mainSiteUrl("/corporate-training?utm_source=blog_cta&utm_medium=inline&utm_campaign=corporate")}
          onClick={() => posthog?.capture("blog_cta_corporate_click")}
          className="cta-corp-action z-20 inline-flex items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--cta-corp-ink)_25%,transparent)] bg-[color-mix(in_oklab,var(--cta-corp-bg)_55%,transparent)] px-6 py-3 text-[max(12px,1.85cqw)] font-semibold text-[var(--cta-corp-ink)] backdrop-blur-sm transition-colors duration-200 hover:border-[var(--cta-corp-accent)] hover:text-[var(--cta-corp-accent)]"
        >
          Book a consultation
        </Link>
      </div>
    </aside>
  );
}
