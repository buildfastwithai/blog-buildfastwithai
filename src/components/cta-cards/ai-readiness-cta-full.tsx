"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePostHog } from "posthog-js/react";

export default function AiReadinessCtaFull() {
  const posthog = usePostHog();
  return (
    <section className="w-full my-16">
      <div className="relative overflow-hidden max-w-7xl mx-auto rounded-3xl bg-card border border-border shadow-lg">
        {/* Background glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-8 py-16 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Sparkles className="w-3 h-3" />
            Personalized Growth Engine
          </div>

          <div className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What’s your <span className="text-primary">AI Score?</span>
          </div>

          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-base md:text-lg">
            Measure your AI readiness and unlock a personalized roadmap with
            curated tools, frameworks, and resources tailored to your role.
          </p>

          <Link href={mainSiteUrl("/tools/ai-readiness")}>
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              onClick={() => posthog.capture("blog_ai_readiness_cta_clicked", { location: "blog_details" })}
            >
              Check My AI Score <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground/80">
            <span>✔ Takes 2 minutes</span>
            <span>✔ Free forever</span>
            <span>✔ Actionable advice</span>
          </div>
        </div>
      </div>
    </section>
  );
}
