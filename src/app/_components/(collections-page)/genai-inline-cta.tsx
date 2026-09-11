"use client";

import { mainSiteUrl } from "@/lib/urls";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";

export default function GenAiInlineCTA() {
  const posthog = usePostHog();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 sm:p-8 shadow-md hover:border-primary/30 transition-all duration-300 group">
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/15 transition-all duration-500 pointer-events-none" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary">
            🚀 Build & Deploy
          </span>
          <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground m-0">
            Go from AI User to AI Builder
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg m-0">
            Will you be among the 1% who build AI Agents, or the 99% who just use them? Get the mentorship, community, and code templates to ship your first AI application.
          </p>
        </div>
        <Link
          href={mainSiteUrl("/agentic-ai?utm_source=blog_collection_middle")}
          onClick={() => {
            posthog.capture("blog_collection_middle_redirect_click");
          }}
          className="shrink-0 w-full sm:w-auto text-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-lg transition-all duration-200 block"
        >
          Start Building Today
        </Link>
      </div>
    </div>
  );
}
