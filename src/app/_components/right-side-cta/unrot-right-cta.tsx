"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function UnrotRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href="https://www.unrot.co?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=unrot_app"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => posthog?.capture("blog_unrot_downlaod_ad")}
      className="group relative block overflow-hidden rounded-[18px] border border-[var(--cta-unrot-border)] bg-[linear-gradient(145deg,var(--cta-unrot-bg)_0%,var(--cta-unrot-bg-2)_100%)] p-4 shadow-[var(--shadow-md)]"
    >
      <span
        aria-hidden
        className="cta-dots pointer-events-none absolute inset-0 text-[color-mix(in_oklab,var(--cta-unrot-accent)_18%,transparent)]"
      />
      <span className="relative z-10 block">
        <span className="flex items-center gap-2.5">
          <span className="flex h-14 w-14 overflow-hidden shrink-0 items-center justify-center rounded-[18px] bg-[var(--cta-unrot-accent)] shadow-[0_10px_28px_color-mix(in_oklab,var(--cta-unrot-accent)_35%,transparent)]">
            <img src="https://app.unrot.co/assets/assets/images/splash-icon.fe63d99b14314caec8b81ae2724ba340.png" alt="Unrot Logo" className="h-full w-full object-cover" />
          </span>
          <span className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--cta-unrot-accent)]">
              5 min AI learning app
            </span>
            <span className="block text-[13px] font-bold tracking-tight text-[var(--cta-unrot-ink)]">
              Unrot
            </span>
          </span>
        </span>
        <span className="mt-2.5 block text-[10.5px] leading-normal text-[var(--cta-unrot-muted)]">
          Learn AI in 5 minutes a day.
        </span>
        <span className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--cta-unrot-accent)] py-2 text-[10px] font-bold text-[var(--cta-unrot-bg)] transition-colors duration-200 group-hover:bg-[var(--cta-unrot-accent-strong)]">
          <Download className="h-3 w-3" />
          Get the app
        </span>
      </span>
    </Link>
  );
}
