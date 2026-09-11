"use client";

import { mainSiteUrl } from "@/lib/urls";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function PromptLibraryRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href={mainSiteUrl("/tools/prompt-library?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=prompt_library")}
      onClick={() => posthog?.capture("blog_sidebar_prompt_library_click")}
      className="group relative block overflow-hidden rounded-[18px] border border-[var(--cta-prompt-border)] bg-[linear-gradient(140deg,var(--cta-prompt-bg)_0%,var(--cta-prompt-bg-2)_100%)] p-4 shadow-[var(--shadow-md)]"
    >
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--cta-prompt-accent-strong)]">
        <Search className="h-3 w-3" />
        Free, no signup
      </span>
      <span className="mt-1.5 block text-[14px] font-bold leading-snug tracking-tight text-[var(--cta-prompt-ink)]">
        500+ prompts library
      </span>
      <span className="mt-1.5 block text-[10.5px] leading-normal text-[var(--cta-prompt-muted)]">
        Sorted by the job you need done. Pasted and used as they are.
      </span>
      <span className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--cta-prompt-accent)] py-2 text-[10px] font-bold text-white transition-colors duration-200 group-hover:bg-[var(--cta-prompt-accent-strong)]">
        Open the library
        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
