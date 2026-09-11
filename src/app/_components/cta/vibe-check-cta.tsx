"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, CornerDownLeft } from "lucide-react";

/**
 * Layout: "fan-out" - one prompt bar branching into every model. The diagram
 * carries the pitch, so the card needs almost no words.
 * Palette: --cta-vibe-*, light arena / dark arena. Flat fills only, no
 * gradients anywhere: solid surfaces, solid strokes, solid button.
 *
 * The connector svg uses preserveAspectRatio="none" so its drop lines stay
 * locked to the 5-column grid below it (centres at 10/30/50/70/90%), with
 * non-scaling strokes so the horizontal squash does not thicken them.
 */

const MODELS = ["Claude", "GPT", "Gemini", "DeepSeek", "Mistral"];

export default function VibeCheckCta() {
  const posthog = usePostHog();

  return (
    <aside className="not-prose group my-8 overflow-hidden rounded-[20px] border border-[var(--cta-vibe-border)] bg-[var(--cta-vibe-bg)] shadow-[var(--shadow-lg)]">
      <div className="p-5 text-center sm:p-6">
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cta-vibe-muted)]">
          Free playground
        </p>

        <h3 className="mb-0 mt-2 text-[23px] font-bold leading-tight tracking-tight text-[var(--cta-vibe-ink)] sm:text-[28px]">
          One prompt.{" "}
          <span className="text-[var(--cta-vibe-accent)]">Every model.</span>
        </h3>

        {/* ── Prompt bar ─────────────────────────────────────────────────── */}
        <div className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-xl border border-[var(--cta-vibe-border)] bg-[var(--cta-vibe-panel)] py-2 pl-3.5 pr-2">
          <span className="flex-1 truncate text-left font-mono text-[11.5px] text-[var(--cta-vibe-muted)]">
            Write one prompt
          </span>
          <span
            aria-hidden
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--cta-vibe-accent)] text-white"
          >
            <CornerDownLeft className="h-3 w-3" strokeWidth={2.5} />
          </span>
        </div>

        {/* ── Fan-out connector ──────────────────────────────────────────── */}
        <svg
          aria-hidden
          viewBox="0 0 100 26"
          preserveAspectRatio="none"
          className="mx-auto block h-6 w-full max-w-md"
        >
          <g
            stroke="var(--cta-vibe-border)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          >
            <line x1="50" y1="0" x2="50" y2="13" />
            <line x1="10" y1="13" x2="90" y2="13" />
            {[10, 30, 50, 70, 90].map((x) => (
              <line key={x} x1={x} y1="13" x2={x} y2="26" />
            ))}
          </g>
        </svg>

        {/* ── Model row. Equal columns, so each chip centre lines up with a
              drop line above it. ───────────────────────────────────────── */}
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5">
          {MODELS.map((model) => (
            <span
              key={model}
              className="truncate rounded-lg border border-[var(--cta-vibe-border)] bg-[var(--cta-vibe-panel)] px-1 py-2 font-mono text-[9px] font-semibold text-[var(--cta-vibe-ink)] sm:text-[10.5px]"
            >
              {model}
            </span>
          ))}
        </div>

        <Link
          href={mainSiteUrl("/vibe-check?utm_source=blog_cta&utm_medium=inline&utm_campaign=vibe_check")}
          onClick={() => posthog?.capture("blog_cta_vibe_check_click")}
          className="cta-vibe-button group/btn mt-5 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-colors duration-200"
        >
          Run a vibe check
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </aside>
  );
}
