"use client";

import { mainSiteUrl } from "@/lib/urls";
import Link from "next/link";
import { ArrowRight, Split } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function VibeCheckRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href={mainSiteUrl("/vibe-check?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=vibe_check")}
      onClick={() => posthog?.capture("blog_sidebar_vibe_check_click")}
      className="group relative block overflow-hidden rounded-[18px] border border-[var(--cta-vibe-border)] bg-[var(--cta-vibe-bg)] p-4 shadow-[var(--shadow-md)] hover:border-[var(--cta-vibe-accent)] transition-colors"
    >
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--cta-vibe-accent-2)]">
        <Split className="h-3 w-3" />
        Free playground
      </span>
      <span className="mt-1.5 block font-serif text-[14px] font-bold leading-snug tracking-tight text-[var(--cta-vibe-ink)]">
        Stop guessing. <span className="text-[var(--cta-vibe-accent)]">Race them.</span>
      </span>
      <span className="mt-1.5 block text-[10.5px] leading-normal text-[var(--cta-vibe-muted)]">
        One prompt, every major model, side by side.
      </span>
      <span className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--cta-vibe-accent)] py-2 text-[10px] font-bold text-white transition-colors duration-200 group-hover:bg-[var(--cta-vibe-accent-strong)]">
        Run a vibe check
        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
