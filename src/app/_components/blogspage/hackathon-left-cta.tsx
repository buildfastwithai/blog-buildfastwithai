"use client";

import { ArrowUpRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";

// Temporary hardcoded promo (AI Build Challenge 2026). Remove once the hackathon closes.
const UNSTOP_URL =
  "https://unstop.com/hackathons/build-fast-with-ai-ai-build-challenge-2026-build-fast-with-ai-1758453?lb=usesFhWX";
const DETAILS_URL =
  "https://www.buildfastwithai.com/hackathon?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=ai_build_challenge_2026";

export function HackathonLeftCta() {
  const posthog = usePostHog();

  return (
    <div
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl p-6 text-foreground",
        // Light: soft indigo-tinted surface
        "border border-indigo-200/70 bg-[linear-gradient(165deg,#ffffff_0%,#f5f4ff_55%,#eeeafc_100%)]",
        "shadow-[0_1px_2px_rgba(49,46,129,0.05),0_24px_48px_-24px_rgba(79,70,229,0.28)]",
        // Dark: deep indigo-tinted surface
        "dark:border-indigo-400/15 dark:bg-[linear-gradient(165deg,#191a2e_0%,#151632_55%,#1a1538_100%)]",
        "dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]",
      ].join(" ")}
    >
      {/* Texture + corner glow */}
      <span
        aria-hidden
        className="cta-dots pointer-events-none absolute inset-0 text-indigo-900/[0.06] dark:text-white/[0.05]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.28)_0%,rgba(129,140,248,0)_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(129,140,248,0.22)_0%,rgba(129,140,248,0)_70%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.45),transparent)]"
      />

      <div className="relative z-10 flex flex-col">
        {/* Eyebrow */}
        <span className="flex items-center gap-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-indigo-600/80 dark:text-indigo-300/80">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Hackathon · Live
        </span>

        {/* Title */}
        <h3 className="mt-5 text-[22px] font-semibold leading-[1.1] tracking-[-0.02em] text-slate-900 dark:text-white">
          AI Build
          <br />
          Challenge{" "}
          <span className="bg-[linear-gradient(90deg,#4f46e5,#7c3aed)] bg-clip-text text-transparent dark:bg-[linear-gradient(90deg,#a5b4fc,#c4b5fd)]">
            2026
          </span>
        </h3>
        <p className="mt-3 text-[12px] leading-relaxed text-slate-600 dark:text-white/60">
          Build a real AI system. Ship it. Get noticed.
        </p>

        {/* Stats — vertical, quiet */}
        <dl className="mt-6 divide-y divide-indigo-900/[0.08] border-y border-indigo-900/[0.08] dark:divide-white/[0.08] dark:border-white/[0.08]">
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-[11px] text-slate-500 dark:text-white/50">Prize pool</dt>
            <dd className="text-[15px] font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
              ₹18,000
            </dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-[11px] text-slate-500 dark:text-white/50">Internship spots</dt>
            <dd className="text-[15px] font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
              10
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <a
          href={UNSTOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            posthog?.capture("blog_sidebar_hackathon_click", { target: "unstop" })
          }
          className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(180deg,#312e81_0%,#1e1b4b_100%)] py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(49,46,129,0.7)] transition-all duration-200 hover:brightness-110 dark:bg-[linear-gradient(180deg,#6366f1_0%,#4f46e5_100%)] dark:shadow-[0_8px_20px_-10px_rgba(99,102,241,0.7)]"
        >
          Register on Unstop
          <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <a
          href={DETAILS_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            posthog?.capture("blog_sidebar_hackathon_click", { target: "details" })
          }
          className="mt-3 text-center text-[11px] text-slate-500 transition-colors hover:text-indigo-700 dark:text-white/45 dark:hover:text-white/80"
        >
          Challenge details
        </a>
      </div>
    </div>
  );
}
