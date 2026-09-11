"use client";

import { mainSiteUrl } from "@/lib/urls";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function AiReadinessRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href={mainSiteUrl("/tools/ai-readiness?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=readiness")}
      onClick={() => posthog?.capture("blog_sidebar_ai_readiness_click")}
      className="group relative block overflow-hidden rounded-[18px] border border-[var(--cta-ready-border)] bg-[linear-gradient(135deg,var(--cta-ready-bg)_0%,var(--cta-ready-bg-2)_100%)] p-4 shadow-[var(--shadow-md)] hover:border-[color-mix(in_oklab,var(--cta-ready-accent)_45%,transparent)] transition-colors duration-300"
    >
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--cta-ready-accent-strong)]">
        <Activity className="h-3 w-3" />
        Free diagnostic
      </span>
      <span className="mt-1.5 block font-serif text-[14px] font-bold leading-snug tracking-tight text-[var(--cta-ready-ink)]">
        How AI-ready are you?
      </span>
      <span className="mt-1.5 block text-[10.5px] leading-normal text-[var(--cta-ready-muted)]">
        Ten questions, one personalised report.
      </span>
      <span className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--cta-ready-accent)] py-2 text-[10px] font-bold text-white transition-colors duration-200 group-hover:bg-[var(--cta-ready-accent-strong)]">
        Start the assessment
        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
