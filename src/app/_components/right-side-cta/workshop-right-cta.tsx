"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { usePostHog } from "posthog-js/react";

interface WorkshopRightCtaProps {
  workshopHref: string;
  eventDay: string | null;
  eventName: string | null;
}

export function WorkshopRightCta({
  workshopHref,
  eventDay,
  eventName,
}: WorkshopRightCtaProps) {
  const posthog = usePostHog();

  return (
    <Link
      href={workshopHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        posthog?.capture("blog_ai_workshop_click", {
          event_name: eventName,
        })
      }
      className="group relative block overflow-hidden rounded-[18px] border border-[var(--cta-workshop-border)] bg-[linear-gradient(140deg,var(--cta-workshop-bg)_0%,var(--cta-workshop-bg-2)_100%)] p-4 shadow-[var(--shadow-md)]"
    >
      <span className="flex items-center gap-1.5">
        <span className="cta-live-dot h-1.5 w-1.5 rounded-full bg-[var(--cta-workshop-accent)]" />
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--cta-workshop-accent-strong)]">
          {eventDay ? `Live ${eventDay}` : "Next live workshop"}
        </span>
      </span>
      <span className="mt-1.5 block font-serif text-[14px] font-bold leading-snug tracking-tight text-[var(--cta-workshop-ink)]">
        Free AI Workshop
      </span>
      <span className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[var(--cta-workshop-muted)]">
        <Calendar className="h-3 w-3" />
        Live session, recording included
      </span>
      <span className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--cta-workshop-accent)] py-2 text-[10px] font-bold text-white transition-colors duration-200 group-hover:bg-[var(--cta-workshop-accent-strong)]">
        Reserve a seat
        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
