"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePostHog } from "posthog-js/react";

export default function ClaudeMasteryCtaFull() {
  const posthog = usePostHog();
  return (
    <section className="w-full my-12">
      <div className="relative overflow-hidden max-w-7xl mx-auto rounded-3xl border border-[#E4DDD4] bg-gradient-to-br from-[#FFF8F4] to-[#FAF8F5] p-8 md:p-12 shadow-[0_12px_40px_rgba(217,123,79,0.04)]">
        {/* Background glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#D97B4F]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#D97B4F]/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-4 py-4 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D97B4F]/10 text-[#D97B4F] text-xs font-semibold mb-6">
            <Sparkles className="w-3 h-3 text-[#D97B4F] animate-pulse" />
            Cohort Program
          </div>

          <div className="text-3xl md:text-4xl font-bold text-[#18150F] mb-4 font-serif leading-tight">
            Claude Mastery: <span className="text-[#D97B4F] italic">Cowork &amp; Code</span>
          </div>

          <p className="text-[#6B6057] max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
            The only comprehensive program designed to take you from basic prompting to building interactive Artifacts, custom integrations, and deploying production-ready code with Claude Code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href={mainSiteUrl("/claude?utm_source=blog_bottom_cta")}>
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full px-10 py-6 text-base font-semibold bg-[#D97B4F] text-white hover:bg-[#B5603A] shadow-[0_6px_20px_rgba(217,123,79,0.3)] transition-all"
                onClick={() => posthog.capture("blog_claude_cta_clicked", { location: "blog_bottom" })}
              >
                Explore Program <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href={mainSiteUrl("/claude?utm_source=blog_bottom_cta&utm_campaign=claude_waitlist")}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full px-10 py-6 text-base font-semibold border-[#D97B4F]/30 hover:bg-[#D97B4F]/5 text-[#D97B4F] transition-all bg-transparent"
                onClick={() => posthog.capture("blog_claude_waitlist_clicked", { location: "blog_bottom" })}
              >
                Join Waitlist
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B6057]">
            <span className="flex items-center gap-1.5">
              <span className="text-[#D97B4F]">✔</span> No coding experience needed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#D97B4F]">✔</span> Cohort-based learning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#D97B4F]">✔</span> Lifetime updates
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

