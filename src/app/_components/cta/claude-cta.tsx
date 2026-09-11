"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";

/**
 * Layout: "book jacket" - a reversed-out terracotta slab carrying the title,
 * over a cream action bar. No body copy and no feature list; the title and the
 * two buttons are the whole card.
 * Palette: --cta-claude-*, on the deeper --cta-claude-slab so white type
 * clears 4.5:1 (the lighter accent only manages 2.4:1).
 *
 * Structurally distinct from the rest of the set: it is the only two-band card
 * with a separate action bar, and the only one leading with a serif display
 * title reversed out of the brand colour.
 */

const RAYS = 10;

/** Anthropic-style burst, drawn as tapered rays so it stays crisp at any size. */
function Burst() {
  const paths = Array.from({ length: RAYS }, (_, i) => {
    const a = (i * 2 * Math.PI) / RAYS - Math.PI / 2;
    const [r0, r1, w0, w1] = [13, 70, 4.6, 2.2];
    const nx = Math.cos(a + Math.PI / 2);
    const ny = Math.sin(a + Math.PI / 2);
    const cx = Math.cos(a);
    const cy = Math.sin(a);
    const p = (r: number, w: number, s: number) =>
      `${(cx * r + nx * w * s).toFixed(2)} ${(cy * r + ny * w * s).toFixed(2)}`;
    return `M${p(r0, w0, 1)} L${p(r1, w1, 1)} L${p(r1, w1, -1)} L${p(r0, w0, -1)} Z`;
  });

  return (
    <svg
      aria-hidden
      viewBox="-80 -80 160 160"
      className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 text-[var(--cta-claude-on-slab)] opacity-[0.14] sm:h-52 sm:w-52"
    >
      <g fill="currentColor">
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

export default function ClaudeCta() {
  const posthog = usePostHog();

  return (
    <aside className="not-prose group my-8 overflow-hidden rounded-[20px] border border-[var(--cta-claude-border)] shadow-[var(--shadow-lg)]">
      {/* ── Jacket ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[linear-gradient(140deg,var(--cta-claude-slab)_0%,var(--cta-claude-slab-2)_100%)] px-5 py-7 sm:px-7 sm:py-9">
        <Burst />

        <div className="relative z-10">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cta-claude-on-slab-soft)]">
            Cohort program
          </p>
          <h3 className="mb-0 mt-3 font-serif text-[26px] font-bold leading-[1.08] tracking-tight text-[var(--cta-claude-on-slab)] sm:text-[34px]">
            Claude Mastery
            <span className="mt-0.5 block font-normal italic text-[var(--cta-claude-on-slab-soft)]">
              Cowork &amp; Code
            </span>
          </h3>
        </div>
      </div>

      {/* ── Action bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 bg-[var(--cta-claude-bg)] px-5 py-4 sm:flex-row sm:items-center sm:px-7">
        <Link
          href={mainSiteUrl("/claude?utm_source=blog_cta&utm_medium=inline&utm_campaign=claude_mastery")}
          onClick={() => posthog?.capture("blog_cta_claude_explore_click")}
          className="relative overflow-hidden rounded-xl bg-[var(--cta-claude-slab)] px-6 py-3 text-center text-sm font-bold text-[var(--cta-claude-on-slab)] transition-colors duration-200 hover:bg-[var(--cta-claude-slab-2)]"
        >
          <span aria-hidden className="cta-sheen pointer-events-none absolute inset-0" />
          <span className="relative">Explore program</span>
        </Link>

        <Link
          href={mainSiteUrl("/claude?utm_source=blog_cta&utm_medium=inline&utm_campaign=claude_waitlist")}
          onClick={() => posthog?.capture("blog_cta_claude_waitlist_click")}
          className="rounded-xl border border-[color-mix(in_oklab,var(--cta-claude-slab)_35%,transparent)] px-6 py-3 text-center text-sm font-bold text-[var(--cta-claude-slab)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--cta-claude-slab)_8%,transparent)]"
        >
          Join waitlist
        </Link>

        <span className="text-[11px] font-medium text-[var(--cta-claude-muted)] sm:ml-auto">
          No coding needed
        </span>
      </div>
    </aside>
  );
}
