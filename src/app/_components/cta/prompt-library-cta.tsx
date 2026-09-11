"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight } from "lucide-react";

/**
 * Layout: "poster" - centred stack of serif eyebrow, an oversized two-line
 * headline with an inline chip set into it, a quiet subline, and a pill.
 * Palette: --cta-prompt-*, warm paper in light / deep plum in dark, violet
 * accent in both.
 *
 * Sizing: `container-type: inline-size`, everything in `cqw`, so the poster
 * holds its proportions at any column width. The headline size is measured,
 * not guessed:
 *   line 1  "500+ PROMPTS [chip] FOR"   12.09em
 *   line 2  "REAL WORK, DONE FAST"      11.62em
 * At 7.44cqw the wider line fills the 90cqw of usable width exactly, and the
 * two lines sit within 96% of each other so the block reads as justified.
 * Both lines are `whitespace-nowrap`. Change the words and re-measure.
 */

/** Mini prompt card, set inline in the headline. Sized in em so it tracks the
 *  font size rather than needing its own breakpoint. */
function PromptChip() {
  return (
    <span
      aria-hidden
      className="mx-[0.16em] inline-flex h-[0.8em] w-[2.05em] -translate-y-[0.1em] flex-col items-center justify-center gap-[0.075em] rounded-[0.16em] bg-[linear-gradient(135deg,var(--cta-prompt-accent)_0%,var(--cta-prompt-accent-strong)_100%)] align-middle"
    >
      {["68%", "80%", "48%"].map((w) => (
        <span
          key={w}
          style={{ width: w }}
          className="block h-[0.07em] rounded-full bg-white/85"
        />
      ))}
    </span>
  );
}

export default function PromptLibraryCta() {
  const posthog = usePostHog();

  return (
    <aside
      style={{ containerType: "inline-size" }}
      className="not-prose group relative my-8 overflow-hidden rounded-[20px] border border-[var(--cta-prompt-border)] bg-[linear-gradient(165deg,var(--cta-prompt-bg)_0%,var(--cta-prompt-bg-2)_100%)] shadow-[var(--shadow-lg)]"
    >
      <div className="px-[4cqw] pb-[max(18px,5cqw)] pt-[max(20px,5.5cqw)] text-center">
        <p className="m-0 font-serif text-[max(10px,1.75cqw)] font-semibold tracking-[0.04em] text-[var(--cta-prompt-ink)]">
          Build Fast with AI Prompt Library
        </p>

        <h3 className="m-0 mt-[2.4cqw] text-[7cqw] font-extrabold uppercase leading-[0.88] tracking-[-0.03em] text-[var(--cta-prompt-ink)]">
          <span className="block whitespace-nowrap">
            500+ prompts
            <PromptChip />
            for
          </span>
          <span className="block whitespace-nowrap">Real work, done fast</span>
        </h3>

        <p className="m-0 mt-[2.4cqw] text-[max(10.5px,1.75cqw)] font-medium text-[var(--cta-prompt-muted)]">
          Engineering, marketing, product, design &amp; 34 more categories
        </p>

        <Link
          href={mainSiteUrl("/tools/prompt-library?utm_source=blog_cta&utm_medium=inline&utm_campaign=prompt_library")}
          onClick={() => posthog?.capture("blog_cta_prompt_library_click")}
          className="cta-prompt-button mt-[3cqw] inline-flex items-center justify-center gap-[0.6em] rounded-full px-[4.5cqw] py-[1.9cqw] text-[max(11px,1.9cqw)] font-semibold shadow-[var(--shadow-md)] transition-colors duration-200"
        >
          Open the library
          <ArrowRight className="h-[1.1em] w-[1.1em]" />
        </Link>
      </div>
    </aside>
  );
}
