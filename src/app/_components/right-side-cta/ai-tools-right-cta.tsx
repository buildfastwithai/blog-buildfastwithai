"use client";

import { mainSiteUrl } from "@/lib/urls";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function AiToolsRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href={mainSiteUrl("/ai-tools?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=ai_tools_library")}
      onClick={() => posthog?.capture("blog_sidebar_ai_tools_click")}
      className="group relative block overflow-hidden rounded-[18px] border border-[var(--cta-tools-border)] bg-[linear-gradient(180deg,var(--cta-tools-bg)_0%,var(--cta-tools-bg-2)_100%)] p-4 shadow-[var(--shadow-md)] hover:border-[color-mix(in_oklab,var(--cta-tools-accent)_45%,transparent)] transition-colors duration-300"
    >
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--cta-tools-accent)]">
        <Layers className="h-3 w-3" />
        The index
      </span>
      <span className="mt-1.5 block font-serif text-[14px] font-bold leading-snug tracking-tight text-[var(--cta-tools-ink)]">
        AI Tools Library
      </span>
      <span className="mt-1.5 block text-[10.5px] leading-normal text-[var(--cta-tools-muted)]">
        276 tools across 23 categories. Every tool we&apos;ve tried, filed by the job it does.
      </span>
      <span className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--cta-tools-accent)] py-2 text-[10px] font-bold text-white transition-colors duration-200 group-hover:bg-[var(--cta-tools-accent-strong)]">
        Browse all tools
        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
