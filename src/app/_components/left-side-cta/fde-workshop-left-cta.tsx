"use client";

import { ArrowUpRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { mainSiteUrl } from "@/lib/urls";

// Temporary promo: "Forward Deployed Engineering: Complete Guide" (FDE Playbook),
// Sat 24 Oct 2026, 7:30 PM IST. Shown on a schedule set in ./left-cta-schedule.tsx.
const LUMA_URL =
  "https://luma.com/9e3iicwh?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=fde_playbook_oct24";
const DETAILS_URL = `${mainSiteUrl("/event/fde")}?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=fde_playbook_oct24`;

export function FdeWorkshopLeftCta() {
  const posthog = usePostHog();

  return (
    <div
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl p-6 text-foreground",
        // Light: warm cream surface
        "border border-amber-200/80 bg-[linear-gradient(165deg,#ffffff_0%,#fffbeb_55%,#fdf3d0_100%)]",
        "shadow-[0_1px_2px_rgba(120,53,15,0.05),0_24px_48px_-24px_rgba(180,83,9,0.3)]",
        // Dark: deep brown surface, matching the Luma event page
        "dark:border-amber-300/15 dark:bg-[linear-gradient(165deg,#2a1a05_0%,#211404_55%,#2d1a04_100%)]",
        "dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]",
      ].join(" ")}
    >
      {/* Texture + corner glow */}
      <span
        aria-hidden
        className="cta-dots pointer-events-none absolute inset-0 text-amber-900/[0.06] dark:text-white/[0.05]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[radial-gradient(circle,rgba(190,242,100,0.35)_0%,rgba(190,242,100,0)_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(190,242,100,0.2)_0%,rgba(190,242,100,0)_70%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(217,119,6,0.5),transparent)]"
      />

      <div className="relative z-10 flex flex-col">
        {/* Eyebrow */}
        <span className="flex items-center gap-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-amber-700/90 dark:text-amber-300/80">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Live Workshop · Registration Open
        </span>

        {/* Title */}
        <h3 className="mt-5 text-[22px] font-semibold leading-[1.1] tracking-[-0.02em] text-slate-900 dark:text-white">
          Forward Deployed
          <br />
          Engineering:{" "}
          <span className="rounded-md bg-lime-300 px-1.5 text-slate-900">
            FDE
          </span>
        </h3>
        <p className="mt-3 text-[12px] leading-relaxed text-slate-600 dark:text-white/60">
          The FDE Playbook: what the role is, the tools it demands, and how to
          start building the skills today.
        </p>

        {/* Details — vertical, quiet */}
        <dl className="mt-6 divide-y divide-amber-900/[0.1] border-y border-amber-900/[0.1] dark:divide-white/[0.08] dark:border-white/[0.08]">
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-[11px] text-slate-500 dark:text-white/50">Date</dt>
            <dd className="text-[13px] font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
              Sat, 24 Oct
            </dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-[11px] text-slate-500 dark:text-white/50">Time</dt>
            <dd className="text-[13px] font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
              7:30 PM IST
            </dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-[11px] text-slate-500 dark:text-white/50">Format</dt>
            <dd className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">
              90 min · Virtual
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <a
          href={LUMA_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            posthog?.capture("blog_sidebar_fde_workshop_click", { target: "luma" })
          }
          className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(180deg,#1c1917_0%,#0c0a09_100%)] py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(28,25,23,0.7)] transition-all duration-200 hover:brightness-125 dark:bg-lime-300 dark:bg-none dark:text-slate-900 dark:shadow-[0_8px_20px_-10px_rgba(190,242,100,0.6)] dark:hover:brightness-95"
        >
          Register for the workshop
          <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <a
          href={DETAILS_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            posthog?.capture("blog_sidebar_fde_workshop_click", { target: "details" })
          }
          className="mt-3 text-center text-[11px] text-slate-500 transition-colors hover:text-amber-700 dark:text-white/45 dark:hover:text-white/80"
        >
          Workshop details
        </a>
      </div>
    </div>
  );
}
