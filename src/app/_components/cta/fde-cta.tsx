"use client";

import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, Users, Rocket, CheckCircle2 } from "lucide-react";

export default function FdeCta() {
  const posthog = usePostHog();

  return (
    <aside className="not-prose group relative my-8 overflow-hidden rounded-[24px] border border-[#171b26] bg-[#07080c] p-6 sm:p-8 text-white shadow-2xl transition-all duration-300 hover:border-[#272f44]">
      {/* Right dot-grid pattern background overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(#1e293a_1.2px,transparent_1.2px)] [background-size:10px_10px] opacity-40"
      />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left Column: Tag, Headline & Subtext */}
        <div className="flex flex-col gap-3 max-w-md">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#2563eb]">
            FDE POD
          </span>

          <h3 className="m-0 font-sans text-2xl font-bold leading-[1.12] tracking-tight text-white sm:text-3xl lg:text-[32px]">
            Embedded with your team.
            <br />
            Ships in <span className="text-[#2563eb]">2 weeks.</span>
          </h3>

          <p className="m-0 mt-1 text-[13px] sm:text-sm font-normal text-slate-400 leading-snug">
            Have a workflow worth automating? Let’s build it.
          </p>
        </div>

        {/* Right Column: 3 Pillars (Top Right) & Button (Bottom Right) */}
        <div className="flex flex-col items-start md:items-end gap-6 sm:gap-7">
          {/* 3 Pillars */}
          <div className="flex items-center gap-5 sm:gap-7">
            <div className="flex flex-col items-center text-center gap-2">
              <Users className="h-6 w-6 text-[#2563eb]" strokeWidth={1.5} />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-slate-300 leading-tight">
                WE WORK
                <br />
                WITH YOU
              </span>
            </div>

            <div className="h-10 w-[1px] bg-[#1a202e]" />

            <div className="flex flex-col items-center text-center gap-2">
              <Rocket className="h-6 w-6 text-[#2563eb]" strokeWidth={1.5} />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-slate-300 leading-tight">
                WE BUILD
                <br />
                IT RIGHT
              </span>
            </div>

            <div className="h-10 w-[1px] bg-[#1a202e]" />

            <div className="flex flex-col items-center text-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-[#2563eb]" strokeWidth={1.5} />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-slate-300 leading-tight">
                YOU OWN
                <br />
                THE SYSTEM
              </span>
            </div>
          </div>

          {/* White Pill Button */}
          <Link
            href="https://deploy.buildfastwithai.com/?utm_source=blog_cta&utm_medium=inline&utm_campaign=fde_pod"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => posthog?.capture("blog_cta_fde_click", { destination: "https://deploy.buildfastwithai.com/" })}
            className="group/btn inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-[#f7f5ef] px-6 py-3.5 text-sm font-bold text-[#08090d] shadow-lg transition-all duration-200 hover:bg-white hover:scale-[1.02]"
          >
            <span>Book a 30-min call</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
