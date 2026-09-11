"use client";

import { mainSiteUrl } from "@/lib/urls";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function AgenticRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href={mainSiteUrl("/agentic-ai?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=agentic_launchpad")}
      onClick={() => posthog?.capture("blog_sidebar_genai_redirect_click")}
      className="group relative block overflow-hidden rounded-[18px] border border-[var(--cta-agentic-border)] bg-[linear-gradient(135deg,var(--cta-agentic-bg)_0%,var(--cta-agentic-bg-2)_100%)] p-4 shadow-[var(--shadow-md)]"
    >
      <span
        aria-hidden
        className="cta-grid pointer-events-none absolute inset-0 text-[color-mix(in_oklab,var(--cta-agentic-ink)_7%,transparent)]"
      />
      <span className="relative z-10 block">
        <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--cta-agentic-accent-2)]">
          <Terminal className="h-3 w-3" />
          6-week cohort
        </span>
        <span className="mt-1.5 block text-[14px] font-bold leading-snug tracking-tight text-[var(--cta-agentic-ink)]">
          Agentic AI Launchpad
        </span>
        <span className="mt-1.5 block text-[10.5px] leading-normal text-[var(--cta-agentic-muted)]">
          Build agents, don&apos;t just use them.
        </span>
        <span className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-[linear-gradient(90deg,var(--cta-agentic-accent),var(--cta-agentic-accent-2))] py-2 text-[10px] font-bold text-[var(--cta-agentic-bg)]">
          Explore program
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  );
}
