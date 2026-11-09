"use client";

import { ArrowUpRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { mainSiteUrl } from "@/lib/urls";

// Temporary promo: paid workshop "Master Claude Code for FDEs" (₹99),
// Sun 22 Nov 2026, 10:00 AM IST. Shown on a schedule set in ./left-cta-schedule.tsx.
const WORKSHOP_URL = `${mainSiteUrl("/workshop/master-claude-code-fdes")}?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=master_claude_code_nov22`;

export function MasterClaudeCodeLeftCta() {
  const posthog = usePostHog();

  return (
    <div
      className={[
        // Tighter padding when the left rail is squeezed (see @container in blog-layout.tsx).
        "group relative flex flex-col overflow-hidden rounded-2xl p-5 text-foreground @[264px]:p-6",
        // Light: soft clay surface (Claude terracotta)
        "border border-orange-200/80 bg-[linear-gradient(165deg,#ffffff_0%,#fdf4ef_55%,#f9e3d6_100%)]",
        "shadow-[0_1px_2px_rgba(124,45,18,0.05),0_24px_48px_-24px_rgba(217,119,87,0.35)]",
        // Dark: deep clay surface
        "dark:border-orange-300/15 dark:bg-[linear-gradient(165deg,#2a150d_0%,#22110a_55%,#2e160c_100%)]",
        "dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]",
      ].join(" ")}
    >
      {/* Texture + corner glow */}
      <span
        aria-hidden
        className="cta-dots pointer-events-none absolute inset-0 text-orange-900/[0.06] dark:text-white/[0.05]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[radial-gradient(circle,rgba(217,119,87,0.35)_0%,rgba(217,119,87,0)_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(217,119,87,0.25)_0%,rgba(217,119,87,0)_70%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(217,119,87,0.55),transparent)]"
      />

      <div className="relative z-10 flex flex-col">
        {/* Eyebrow */}
        <span className="flex items-center gap-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-orange-700/90 dark:text-orange-300/80">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Live Workshop · Limited Seats
        </span>

        {/* Title */}
        <h3 className="mt-5 text-[19px] @[264px]:text-[22px] font-semibold leading-[1.1] tracking-[-0.02em] text-slate-900 dark:text-white">
          Master{" "}
          <span className="rounded-md bg-[#d97757] px-1.5 text-white">
            Claude Code
          </span>
          <br />
          for FDEs
        </h3>
        <p className="mt-3 text-[12px] leading-relaxed text-slate-600 dark:text-white/60">
          Stop prompting, start building. Build a working AI agent with Claude
          Code, connect tools with MCP, and turn workflows into Skills.
        </p>

        {/* Details — vertical, quiet */}
        <dl className="mt-6 divide-y divide-orange-900/[0.1] border-y border-orange-900/[0.1] dark:divide-white/[0.08] dark:border-white/[0.08]">
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-[11px] text-slate-500 dark:text-white/50">Date</dt>
            <dd className="text-[13px] font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
              Sun, 22 Nov
            </dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-[11px] text-slate-500 dark:text-white/50">Time</dt>
            <dd className="text-[13px] font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
              10:00 AM IST
            </dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-[11px] text-slate-500 dark:text-white/50">Price</dt>
            <dd className="flex items-baseline gap-1.5 tabular-nums tracking-tight">
              <span className="text-[11px] text-slate-400 line-through dark:text-white/35">
                ₹999
              </span>
              <span className="text-[15px] font-semibold text-slate-900 dark:text-white">
                ₹99
              </span>
            </dd>
          </div>
        </dl>

        {/* Action */}
        <a
          href={WORKSHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            posthog?.capture("blog_sidebar_master_claude_code_click", { target: "workshop" })
          }
          className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(180deg,#1c1917_0%,#0c0a09_100%)] py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(28,25,23,0.7)] transition-all duration-200 hover:brightness-125 dark:bg-[#d97757] dark:bg-none dark:text-white dark:shadow-[0_8px_20px_-10px_rgba(217,119,87,0.6)] dark:hover:brightness-110"
        >
          Reserve your spot · ₹99
          <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <p className="mt-3 text-center text-[11px] text-slate-500 dark:text-white/45">
          90 min live · Recording included
        </p>
      </div>
    </div>
  );
}
