"use client";

import React from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { Download, Star } from "lucide-react";
import { unrotAppUrl } from "@/lib/urls";

/**
 * Layout: purple banner (mascot, rating, white pill install button).
 * Palette: Unrot brand violet + yellow stars, fixed in both themes so the app
 * reads the same everywhere it appears.
 *
 * Unrot is our own product but lives on its own subdomain (app.), so this CTA
 * opens in a new tab.
 */

const GRID_BG =
  "[background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:44px_44px]";

function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12 0c.9 5.8 3.2 9.1 12 12-8.8 2.9-11.1 6.2-12 12-.9-5.8-3.2-9.1-12-12C8.8 9.1 11.1 5.8 12 0Z" />
    </svg>
  );
}

export default function UnrotCta() {
  const posthog = usePostHog();

  return (
    <aside className="not-prose group relative my-8 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#7b5cff_0%,#5b3df5_100%)] shadow-[0_18px_40px_-14px_rgba(91,61,245,0.55)]">
      <div aria-hidden className={`pointer-events-none absolute inset-0 ${GRID_BG}`} />
      <Sparkle className="pointer-events-none absolute left-4 top-3 h-5 w-5 text-white/25" />
      <Sparkle className="pointer-events-none absolute bottom-3 right-[42%] hidden h-7 w-7 text-white/20 md:block" />

      <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:gap-6">
        {/* App identity */}
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <img
            src="/unrot/unrot-mascot.webp"
            alt="Unrot mascot"
            width={600}
            height={506}
            loading="lazy"
            className="h-[76px] w-auto shrink-0 drop-shadow-[0_10px_18px_rgba(30,12,120,0.45)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-[92px]"
          />

          <div className="min-w-0">
            <h3 className="m-0 text-[22px] font-extrabold leading-tight tracking-tight text-white sm:text-[26px]">
              Unrot
            </h3>
            <p className="mb-0 mt-1 text-[14px] leading-snug text-white/80 sm:text-[15px]">
              Learn AI in just 5 minutes a day.
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5" aria-label="Rated 4.8 out of 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-[#ffc933] text-[#ffc933]"
                  />
                ))}
              </span>
              <span className="text-[13px] font-bold text-white">4.8</span>
            </div>
          </div>
        </div>

        {/* Install */}
        <Link
          href={unrotAppUrl("blog_cta", "inline")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => posthog?.capture("blog_cta_unrot_click")}
          className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-[#5b3df5] shadow-[0_10px_24px_-8px_rgba(20,8,90,0.5)] transition-all duration-200 hover:scale-[1.03] hover:bg-white/95 md:min-w-[190px]"
        >
          <Download className="h-[18px] w-[18px]" />
          Get the app
        </Link>
      </div>
    </aside>
  );
}
