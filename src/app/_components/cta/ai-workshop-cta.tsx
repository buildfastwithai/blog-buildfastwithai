"use client";

import { mainSiteUrl } from "@/lib/urls";
import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, FolderOpen, PlayCircle, Radio } from "lucide-react";

/**
 * Layout: "ticket stub" (perforated two-panel pass).
 * Palette: amber (--cta-workshop-*).
 *
 * Mirrors what /ai-workshops actually offers: the live Luma sessions, the
 * recordings, and the free resource library. The Luma event title is
 * deliberately not rendered, it changes every week and reads as noise here.
 * Only the date and the registration link are taken from the feed.
 */

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const WORKSHOPS_PAGE = mainSiteUrl("/ai-workshops");

const INCLUDES = [
  { icon: Radio, text: "Live hands-on sessions" },
  { icon: PlayCircle, text: "Workshop recordings" },
  { icon: FolderOpen, text: "Free resource library" },
];

export default function AiWorkshopCta() {
  const posthog = usePostHog();
  const { data } = useSWR("/api/events", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const entries = data?.entries ?? [];
  const event = entries[0]?.event;

  // Primary action goes straight to the next Luma registration when there is
  // one, and falls back to the workshops page when the calendar is empty.
  let primaryHref = WORKSHOPS_PAGE;
  if (event?.url) {
    try {
      const url = new URL(event.url);
      url.searchParams.set("utm_source", "blog_cta");
      url.searchParams.set("utm_medium", "inline");
      url.searchParams.set("utm_campaign", "free_ai_workshop");
      primaryHref = url.toString();
    } catch {
      primaryHref = event.url;
    }
  }
  const isExternal = primaryHref.startsWith("http");

  const date = event?.start_at ? new Date(event.start_at) : null;
  const day = date ? date.toLocaleDateString("en-US", { day: "numeric" }) : null;
  const month = date
    ? date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : null;

  return (
    <aside className="not-prose group my-8 overflow-hidden rounded-[20px] border border-[var(--cta-workshop-border)] bg-[linear-gradient(120deg,var(--cta-workshop-bg)_0%,var(--cta-workshop-bg-2)_100%)] shadow-[var(--shadow-lg)]">
      <div className="flex flex-col sm:flex-row">
        {/* Stub */}
        <div className="relative flex shrink-0 items-center justify-center bg-[color-mix(in_oklab,var(--cta-workshop-accent)_12%,transparent)] px-5 py-5 sm:w-[132px] sm:py-6">
          <div className="text-center">
            {day ? (
              <>
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cta-workshop-accent-strong)]">
                  {month}
                </p>
                <p className="m-0 mt-1 font-serif text-[36px] font-bold leading-none text-[var(--cta-workshop-ink)]">
                  {day}
                </p>
              </>
            ) : (
              <p className="m-0 font-serif text-[26px] font-bold leading-none text-[var(--cta-workshop-ink)]">
                Live
              </p>
            )}
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[var(--cta-workshop-accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <span className="cta-live-dot h-1.5 w-1.5 rounded-full bg-white" />
              Free
            </span>
          </div>

          {/* perforation */}
          <span
            aria-hidden
            className="absolute bottom-0 left-0 right-0 border-b-2 border-dashed border-[var(--cta-workshop-border)] sm:left-auto sm:top-0 sm:w-0 sm:border-b-0 sm:border-r-2"
          />
          <span
            aria-hidden
            className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-[var(--background)] sm:-right-2.5 sm:bottom-auto sm:left-auto sm:top-1/2 sm:translate-x-0 sm:-translate-y-1/2"
          />
        </div>

        {/* Body */}
        <div className="flex-1 p-5 sm:p-6">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cta-workshop-accent-strong)]">
            {entries.length > 1
              ? `${entries.length} sessions open`
              : "Next session open"}
          </p>
          <h3 className="mb-0 mt-1.5 font-serif text-[21px] font-bold leading-tight tracking-tight text-[var(--cta-workshop-ink)] sm:text-[24px]">
            Free AI Workshop
          </h3>

          <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-5 gap-y-2 border-t border-dashed border-[var(--cta-workshop-border)] p-0 pt-3">
            {INCLUDES.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="m-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--cta-workshop-muted)]"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--cta-workshop-accent)]" />
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              href={primaryHref}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              onClick={() => posthog?.capture("blog_cta_ai_workshop_click")}
              className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--cta-workshop-accent)] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_color-mix(in_oklab,var(--cta-workshop-accent)_32%,transparent)] transition-colors duration-200 hover:bg-[var(--cta-workshop-accent-strong)]"
            >
              <span aria-hidden className="cta-sheen pointer-events-none absolute inset-0" />
              <span className="relative">Reserve my seat</span>
              <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
            <Link
              href={`${WORKSHOPS_PAGE}?utm_source=blog_cta&utm_medium=inline&utm_campaign=workshops_page`}
              onClick={() => posthog?.capture("blog_cta_ai_workshops_page_click")}
              className="rounded-xl border border-[color-mix(in_oklab,var(--cta-workshop-accent)_35%,transparent)] px-6 py-3 text-center text-sm font-bold text-[var(--cta-workshop-accent-strong)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--cta-workshop-accent)_10%,transparent)]"
            >
              All workshops
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
