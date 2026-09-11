"use client";

import { mainSiteUrl } from "@/lib/urls";
import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function CorporateRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href={mainSiteUrl("/corporate-training?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=corporate")}
      onClick={() => posthog?.capture("blog_sidebar_corporate_click")}
      className="group relative block overflow-hidden rounded-[18px] border border-[var(--cta-corp-border)] bg-[linear-gradient(160deg,var(--cta-corp-bg)_0%,var(--cta-corp-bg-2)_100%)] p-4 shadow-[var(--shadow-md)]"
    >
      <span className="absolute top-0 left-0 h-[3px] w-full bg-[linear-gradient(90deg,transparent_0%,var(--cta-corp-accent)_35%,var(--cta-corp-accent-strong)_70%,transparent_100%)]" />
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--cta-corp-accent)]">
        <Users className="h-3 w-3" />
        For teams
      </span>
      <span className="mt-1.5 block font-serif text-[14px] font-bold leading-snug tracking-tight text-[var(--cta-corp-ink)]">
        Train your whole org
      </span>
      <span className="mt-1.5 block text-[10.5px] leading-normal text-[var(--cta-corp-muted)]">
        Private programme, on-site or remote.
      </span>
      <span className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--cta-corp-accent)] py-2 text-[10px] font-bold text-[var(--cta-corp-bg)] transition-colors duration-200 group-hover:bg-[var(--cta-corp-accent-strong)]">
        Book a consultation
        <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
