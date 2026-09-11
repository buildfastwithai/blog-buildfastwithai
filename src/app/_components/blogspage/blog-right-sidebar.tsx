"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { usePostHog } from "posthog-js/react";
import { UnrotRightCta } from "../right-side-cta/unrot-right-cta";
import { WorkshopRightCta } from "../right-side-cta/workshop-right-cta";
import { AgenticRightCta } from "../right-side-cta/agentic-right-cta";
import { ClaudeRightCta } from "../right-side-cta/claude-right-cta";
import { NewsletterRightCta } from "../right-side-cta/newsletter-right-cta";
import { VibeCheckRightCta } from "../right-side-cta/vibe-check-right-cta";
import { CorporateRightCta } from "../right-side-cta/corporate-right-cta";
import { AiReadinessRightCta } from "../right-side-cta/ai-readiness-right-cta";
import { PromptLibraryRightCta } from "../right-side-cta/prompt-library-right-cta";
import { AiToolsRightCta } from "../right-side-cta/ai-tools-right-cta";
import { FdeRightCta } from "../right-side-cta/fde-right-cta";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BlogRightSidebarProps {
  isVisible: boolean;
  activeCtas?: string[];
}

  export function BlogRightSidebar({ isVisible, activeCtas = [] }: BlogRightSidebarProps) {
    const posthog = usePostHog();
  
    const { data } = useSWR("/api/events", fetcher, {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    });
  
    const event = data?.entries?.[0]?.event;
  
    let workshopHref = "https://www.buildfastwithai.com/events";
    if (event?.url) {
      try {
        const url = new URL(event.url);
        url.searchParams.set("utm_source", "blog_sidebar_workshop");
        workshopHref = url.toString();
      } catch {
        workshopHref = event.url;
      }
    }
  
    const eventDate = event?.start_at ? new Date(event.start_at) : null;
    const eventDay = eventDate
      ? eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : null;
  
    const renderCta = (name: string, key: string) => {
      switch (name) {
        case "agentic": return <AgenticRightCta key={key} />;
        case "claude": return <ClaudeRightCta key={key} />;
        case "ai-workshop": return <WorkshopRightCta key={key} workshopHref={workshopHref} eventDay={eventDay} eventName={event?.name ?? null} />;
        case "corporate": return <CorporateRightCta key={key} />;
        case "ai-readiness": return <AiReadinessRightCta key={key} />;
        case "prompt-library": return <PromptLibraryRightCta key={key} />;
        case "unrot": return <UnrotRightCta key={key} />;
        case "ai-tools": return <AiToolsRightCta key={key} />;
        case "vibe-check": return <VibeCheckRightCta key={key} />;
        case "newsletter": return <NewsletterRightCta key={key} />;
        case "fde": return <FdeRightCta key={key} />;
        default: return null;
      }
    };
  
    const normalizeName = (name: string) => {
      if (name === "free-workshop") return "ai-workshop";
      if (name === "tools") return "ai-tools";
      if (name === "vibecheck") return "vibe-check";
      return name;
    };
  
    const DEFAULTS = ["unrot", "ai-workshop", "newsletter"];
    const normalizedTopCtas = Array.from(new Set(activeCtas.map(normalizeName)));
    
    const ctasToRender = normalizedTopCtas.length > 0
      ? normalizedTopCtas.slice(0, 2)
      : DEFAULTS;  
    return (
      <div
        className={cn(
          "hidden xl:block absolute -right-[310px] top-14 h-full pointer-events-none transition-all duration-700 ease-out delay-150",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}
      >
        <div
          className={cn(
            "sticky top-24 w-[240px] flex flex-col gap-3 max-h-[calc(100vh-8rem)] overflow-y-auto pb-4 pr-1 [&>*]:shrink-0",
            /* Custom scrollbar styling instead of hiding it */
            "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
            isVisible ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          {ctasToRender.map((ctaName, index) => renderCta(ctaName, `sidebar-cta-${index}-${ctaName}`))}
        </div>
      </div>
    );
  }
