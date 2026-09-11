"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowUpRight } from "lucide-react";

/**
 * Layout: "schematic sheet" - a white plan drawing with a routed circuit of
 * rounded tracks, labelled at each node, and the headline set flush right.
 * Palette: white + royal blue (--cta-agentic-*).
 *
 * Geometry notes: the track and the module rects are kept at least 30px apart
 * so no stroke ever doubles up, and every label sits in clear space rather
 * than on a line. Change one, re-check the other.
 */

// Track: 0,168 -> 176,258 -> 356,386 -> 726,344 -> right edge at y=318.
const TRACK =
  "M0 168 H150 Q176 168 176 194 V258 Q176 284 202 284 H330 Q356 284 356 310 V386 Q356 412 382 412 H700 Q726 412 726 386 V344 Q726 318 752 318 H1120";

// Modules sit below/right of the track with a 34px minimum gap.
const MODULES = [
  { x: 58, y: 330, width: 230, height: 240 },
  { x: 444, y: 452, width: 300, height: 190 },
  { x: 772, y: 352, width: 200, height: 220 },
];

// Placed in open space, not on a stroke.
const NODES = [
  { x: 88, y: 372, label: "LLM AGENTS" },
  { x: 392, y: 368, label: "RAG PIPELINES" },
  { x: 474, y: 492, label: "TOOL CALLING" },
  { x: 802, y: 392, label: "DEPLOYMENT" },
];

export default function AgenticCta() {
  const posthog = usePostHog();

  return (
    <aside
      style={{ containerType: "inline-size" }}
      className="not-prose group relative my-8 overflow-hidden rounded-[20px] border border-[var(--cta-agentic-border)] bg-[var(--cta-agentic-bg)] shadow-[var(--shadow-lg)]"
    >
      {/* ── Schematic ─────────────────────────────────────────────────── */}
      <svg
        aria-hidden
        viewBox="0 0 1120 520"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <g
          fill="none"
          stroke="var(--cta-agentic-line)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        >
          <path d={TRACK} />
          {MODULES.map((m) => (
            <rect key={`${m.x}-${m.y}`} {...m} rx="26" />
          ))}
        </g>

        <g className="cta-agentic-labels">
          {NODES.map((node) => (
          <text
            key={node.label}
            x={node.x}
            y={node.y}
            fill="var(--cta-agentic-accent)"
            fillOpacity="0.55"
            className="font-mono"
            fontSize="15"
            letterSpacing="1.6"
          >
            {node.label}
            </text>
          ))}
        </g>
      </svg>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-[320px] flex-col gap-6 p-6 sm:min-h-[380px] sm:p-8 md:flex-row md:items-start md:justify-between md:gap-10">
        <span className="inline-flex shrink-0 items-center gap-2 pt-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.22em] text-[var(--cta-agentic-accent)]">
          <span className="h-1 w-1 rounded-full bg-[var(--cta-agentic-accent)]" />
          Let&apos;s build
        </span>

        <div className="md:w-[540px] md:shrink-0">
          <h3 className="mb-0 text-[30px] font-bold leading-[1.04] tracking-[-0.03em] text-[var(--cta-agentic-ink)] sm:text-[42px]">
            Start building AI agents with Build Fast
          </h3>

          <div className="mt-5 flex flex-wrap items-stretch gap-2.5">
            <Link
              href={mainSiteUrl("/agentic-ai?utm_source=blog_cta&utm_medium=inline&utm_campaign=agentic_launchpad")}
              onClick={() => posthog?.capture("blog_cta_agentic_explore_click")}
              className="inline-flex items-stretch overflow-hidden bg-[var(--cta-agentic-accent)] text-white transition-colors duration-200 hover:bg-[var(--cta-agentic-accent-2)]"
            >
              <span className="flex items-center px-4 py-2.5 text-[13px] font-semibold leading-none">
                Explore Program
              </span>
              <span className="flex w-9 items-center justify-center border-l border-white/25">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>

            {/* The waitlist dialog lives on the main site; send readers to the
                program page, which opens it. */}
            <Link
              href={mainSiteUrl("/agentic-ai?utm_source=blog_cta&utm_medium=inline&utm_campaign=agentic_waitlist")}
              onClick={() => posthog?.capture("blog_cta_agentic_waitlist_click")}
              className="inline-flex items-center border border-[var(--cta-agentic-accent)] px-4 py-2.5 text-[13px] font-semibold leading-none text-[var(--cta-agentic-accent)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--cta-agentic-accent)_8%,transparent)]"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
