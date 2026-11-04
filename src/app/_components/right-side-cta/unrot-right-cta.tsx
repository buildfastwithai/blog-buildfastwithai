"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { unrotAppUrl } from "@/lib/urls";

// Brand violet is fixed in both themes. The backdrop, sizes and type colours sit
// in inline styles so the card keeps its look inside the sidebar's scroll box.
const VIOLET = "#5b3df5";
const GRID_LINE = "rgba(255,255,255,0.07)";

export function UnrotRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href={unrotAppUrl("blog_sidebar", "sidebar")}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => posthog?.capture("blog_unrot_downlaod_ad")}
      className="group relative block overflow-hidden text-center"
      style={{
        borderRadius: 22,
        padding: "20px 16px 16px",
        backgroundColor: VIOLET,
        backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px), linear-gradient(160deg, #7b5cff 0%, ${VIOLET} 100%)`,
        backgroundSize: "36px 36px, 36px 36px, 100% 100%",
        boxShadow: "0 16px 36px -14px rgba(91,61,245,0.55)",
      }}
    >
      <span className="relative z-10 block">
        <span
          className="relative mx-auto block"
          style={{ width: 124, height: 104 }}
        >
          <img
            src="/unrot/unrot-mascot.webp"
            alt="Unrot mascot"
            width={600}
            height={506}
            loading="lazy"
            className="transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 10px 16px rgba(30,12,120,0.45))",
            }}
          />
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="#ffffff"
            style={{ position: "absolute", top: 0, right: -4, width: 18, height: 18 }}
          >
            <path d="M12 0c.9 5.8 3.2 9.1 12 12-8.8 2.9-11.1 6.2-12 12-.9-5.8-3.2-9.1-12-12C8.8 9.1 11.1 5.8 12 0Z" />
          </svg>
        </span>

        <span
          className="block font-extrabold"
          style={{
            marginTop: 12,
            fontSize: 20,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "#ffffff",
          }}
        >
          Get yourself
          <span className="block" style={{ color: "#ffe11a" }}>
            upskilled in AI
          </span>
          for free.
        </span>

        <span
          className="flex w-full items-center justify-center font-bold transition-transform duration-200 group-hover:scale-[1.03]"
          style={{
            marginTop: 16,
            gap: 4,
            padding: "10px 0",
            borderRadius: 999,
            fontSize: 13,
            backgroundColor: "#ffffff",
            color: VIOLET,
            boxShadow: "0 8px 18px -8px rgba(20,8,90,0.5)",
          }}
        >
          Get the app
          <ChevronRight style={{ width: 16, height: 16 }} />
        </span>
      </span>
    </Link>
  );
}
