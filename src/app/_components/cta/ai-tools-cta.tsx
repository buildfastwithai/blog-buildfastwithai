"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight } from "lucide-react";

/**
 * Layout: "index page" - an editorial table of contents, set in two columns.
 * Palette: paper + signal red (--cta-tools-*).
 * Target: the AI Tools Library (23 categories, 276 tools).
 */

const CATEGORIES = [
  "Coding & Development",
  "Automation & Agents",
  "Deep Research",
  "App Builders (Vibe Coding)",
  "Video Generation",
  "Design & Creative",
];

export default function AiToolsCta() {
  const posthog = usePostHog();

  return (
    <aside className="not-prose group my-8 overflow-hidden rounded-[20px] border border-[var(--cta-tools-border)] bg-[linear-gradient(180deg,var(--cta-tools-bg)_0%,var(--cta-tools-bg-2)_100%)] shadow-[var(--shadow-lg)]">
      <div className="p-5 sm:p-6">
        {/* ── Masthead ───────────────────────────────────────────────── */}
        <div className="flex items-end justify-between gap-4 border-b-2 border-[var(--cta-tools-ink)] pb-3">
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cta-tools-accent)]">
              The index
            </p>
            <h3 className="mb-0 mt-1.5 font-serif text-[21px] font-bold leading-none tracking-tight text-[var(--cta-tools-ink)] sm:text-[25px]">
              AI Tools Library
            </h3>
          </div>
          <p className="m-0 hidden text-right font-mono text-[11px] font-medium leading-tight text-[var(--cta-tools-muted)] sm:block">
            276 tools
            <br />
            23 categories
          </p>
        </div>

        <p className="mb-0 mt-3 max-w-xl text-sm leading-relaxed text-[var(--cta-tools-muted)]">
          Every tool we&apos;ve tried, filed by the job it does.
        </p>

        {/* ── Two-column index ───────────────────────────────────────── */}
        <ul className="m-0 mt-4 grid list-none gap-x-8 gap-y-0 p-0 sm:grid-cols-2">
          {CATEGORIES.map((category, i) => (
            <li
              key={category}
              className="m-0 flex items-baseline gap-3 border-b border-dotted border-[var(--cta-tools-border)] py-2"
            >
              <span className="font-mono text-[10px] font-bold text-[var(--cta-tools-accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[13px] font-medium text-[var(--cta-tools-ink)]">
                {category}
              </span>
            </li>
          ))}
        </ul>

        {/* ── Action ─────────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={mainSiteUrl("/ai-tools?utm_source=blog_cta&utm_medium=inline&utm_campaign=ai_tools_library")}
            onClick={() => posthog?.capture("blog_cta_ai_tools_click")}
            className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cta-tools-accent)] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_color-mix(in_oklab,var(--cta-tools-accent)_26%,transparent)] transition-all duration-200 hover:bg-[var(--cta-tools-accent-strong)] sm:w-auto"
          >
            Browse all 276 tools
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>
          <span className="text-[11px] font-medium text-[var(--cta-tools-muted)]">
            Free to browse
          </span>
        </div>
      </div>
    </aside>
  );
}
