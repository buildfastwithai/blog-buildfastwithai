"use client";

import { mainSiteUrl } from "@/lib/urls";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";

export default function GenAiSidebarCTA() {
  const posthog = usePostHog();

  return (
    <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-primary/5 via-card to-primary/10 border border-primary/15 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />
      
      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-primary/10 text-primary mb-3">
          Waitlist Open
        </span>
        <div className="font-bold text-sm text-foreground mb-1">Agentic AI Launchpad</div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Will you be among the 1% who build AI Agents, or the 99% who just use them? Master AI app development.
        </p>

        <ul className="space-y-1.5 mb-4">
          {[
            "6 Weeks Live Mentorship",
            "Build & Deploy 5+ Apps",
            "No Coding Required"
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <svg className="size-3 text-sky-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href={mainSiteUrl("/agentic-ai?utm_source=blog_collection_sidebar")}
          onClick={() => {
            posthog.capture("blog_collection_sidebar_genai_redirect_click");
          }}
          className="w-full font-semibold text-xs py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg shadow-sm text-center block"
        >
          Explore Program
        </Link>
      </div>
    </div>
  );
}
