"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";

/**
 * Layout: "banner slab" - ink-navy panel, light headline stacked over a small
 * subline and a pill action, with an organic 3D tube knot bleeding off the
 * right edge.
 * Palette: --cta-ready-*, ink-navy ground with a bright teal accent. Teal
 * rather than the reference's lime, so it stays distinct from the Unrot card.
 *
 * Sizing: `container-type: inline-size`, so everything is in `cqw` and scales
 * off the CARD width. Measured clearance, against the knot's INK bounds rather
 * than its svg box (the big ring's left edge is at x=57 of a 300 viewBox, so
 * the box starts well before the drawing does):
 *   headline at 5.6cqw ends at 63.5cqw ; leftmost ink at 70.5cqw -> 7cqw gap
 * A longer headline or a larger size will run under the artwork.
 */

export default function AiReadinessCta() {
  const posthog = usePostHog();

  return (
    <aside
      style={{ containerType: "inline-size" }}
      className="not-prose group relative my-8 overflow-hidden rounded-[20px] border border-[var(--cta-ready-border)] bg-[linear-gradient(120deg,var(--cta-ready-bg)_0%,var(--cta-ready-bg-2)_100%)] shadow-[var(--shadow-xl)]"
    >
      {/* glow behind the knot */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[6cqw] top-1/2 h-[38cqw] w-[38cqw] -translate-y-1/2 rounded-full bg-[color-mix(in_oklab,var(--cta-ready-accent)_26%,transparent)] blur-[60px]"
      />

      {/* ── Tube knot ─────────────────────────────────────────────────── */}
      <svg
        aria-hidden
        viewBox="0 0 300 220"
        className="pointer-events-none absolute -bottom-[4cqw] -right-[2cqw] w-[max(96px,30cqw)]"
      >
        <defs>
          <linearGradient id="ready-tube" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--cta-ready-accent-lift)" />
            <stop offset="52%" stopColor="var(--cta-ready-accent)" />
            <stop offset="100%" stopColor="var(--cta-ready-accent-strong)" />
          </linearGradient>
          <linearGradient id="ready-sheen" x1="0" y1="0" x2="0.6" y2="1">
            <stop
              offset="0%"
              stopColor="var(--cta-ready-accent-lift)"
              stopOpacity="0.85"
            />
            <stop
              offset="100%"
              stopColor="var(--cta-ready-accent-lift)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <g fill="none" strokeLinecap="round">
          {/* back ring */}
          <circle
            cx="140"
            cy="95"
            r="62"
            stroke="url(#ready-tube)"
            strokeWidth="42"
          />
          {/* front ring, threaded through it */}
          <circle
            cx="232"
            cy="150"
            r="48"
            stroke="url(#ready-tube)"
            strokeWidth="36"
          />
          {/* the arc of the back ring that passes OVER the front one,
              redrawn last so the two read as interlocked */}
          <path
            d="M201 84 A62 62 0 0 1 156 155"
            stroke="url(#ready-tube)"
            strokeWidth="42"
          />
          {/* specular highlight along the upper-left of the big ring */}
          <path
            d="M119 37 A62 62 0 0 0 82 74"
            stroke="url(#ready-sheen)"
            strokeWidth="13"
          />
          {/* loose nub, echoing the reference */}
          <circle
            cx="86"
            cy="182"
            r="4"
            stroke="url(#ready-tube)"
            strokeWidth="30"
          />
        </g>
      </svg>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 p-[max(18px,5cqw)]">
        <h3 className="m-0 max-w-[64cqw] text-[max(22px,5.6cqw)] font-normal leading-[1.06] tracking-[-0.02em] text-[var(--cta-ready-ink)]">
          How AI-ready are you?
        </h3>
        <p className="m-0 mt-[1.6cqw] text-[max(11px,2cqw)] font-medium leading-snug text-[var(--cta-ready-muted)]">
          Take the free 5-minute assessment
        </p>

        <Link
          href={mainSiteUrl("/tools/ai-readiness?utm_source=blog_cta&utm_medium=inline&utm_campaign=readiness")}
          onClick={() => posthog?.capture("blog_cta_ai_readiness_click")}
          className="mt-[4cqw] inline-flex items-center justify-center rounded-full bg-[var(--cta-ready-accent)] px-[max(20px,4cqw)] py-[max(11px,1.8cqw)] text-[max(11px,1.95cqw)] font-semibold text-[var(--cta-ready-bg)] transition-colors duration-200 hover:bg-[var(--cta-ready-accent-lift)]"
        >
          Start the assessment
        </Link>
      </div>
    </aside>
  );
}
