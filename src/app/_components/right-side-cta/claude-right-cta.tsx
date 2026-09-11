"use client";

import { mainSiteUrl } from "@/lib/urls";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function ClaudeRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href={mainSiteUrl("/claude?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=claude_mastery")}
      onClick={() => posthog?.capture("blog_sidebar_claude_redirect_click")}
      className="group relative block overflow-hidden rounded-[18px] border border-[var(--cta-claude-border)] bg-[linear-gradient(150deg,var(--cta-claude-bg)_0%,var(--cta-claude-bg-2)_100%)] p-4 shadow-[var(--shadow-md)]"
    >
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--cta-claude-accent-strong)]">
        <Sparkles className="h-3 w-3" />
        Cohort program
      </span>
      <span className="mt-1.5 block font-serif text-[14px] font-bold leading-snug tracking-tight text-[var(--cta-claude-ink)]">
        Claude Mastery:{" "}
        <span className="font-normal italic text-[var(--cta-claude-accent)]">
          Cowork &amp; Code
        </span>
      </span>
      <span className="mt-1.5 block text-[10.5px] leading-normal text-[var(--cta-claude-muted)]">
        Prompting to shipping, no coding needed.
      </span>
      <span className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--cta-claude-accent)] py-2 text-[10px] font-bold text-white transition-colors duration-200 group-hover:bg-[var(--cta-claude-accent-strong)]">
        Explore program
        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
