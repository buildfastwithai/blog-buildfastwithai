"use client";

import Link from "next/link";
import { ArrowRight, Cpu } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function FdeRightCta() {
  const posthog = usePostHog();

  return (
    <Link
      href="https://deploy.buildfastwithai.com/?utm_source=blog_sidebar&utm_medium=sidebar&utm_campaign=fde_pod"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => posthog?.capture("blog_sidebar_fde_click", { destination: "https://deploy.buildfastwithai.com/" })}
      className="group relative block overflow-hidden rounded-[20px] border border-[#171b26] bg-[#07080c] p-5 text-white shadow-xl transition-all duration-300 hover:border-[#272f44] hover:shadow-2xl"
    >
      {/* Background dot-grid overlay */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(#1e293a_1.2px,transparent_1.2px)] [background-size:10px_10px] opacity-35"
      />
      
      {/* Subtle blue corner glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl"
      />

      <span className="relative z-10 flex flex-col gap-3">
        <span className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#2563eb]">
          <Cpu className="h-3 w-3" />
          FDE Pod
        </span>

        <div>
          <span className="block text-[15px] font-bold leading-snug tracking-tight text-white">
            Have a workflow worth automating?
          </span>
          <span className="mt-1 block font-mono text-[12px] font-medium text-slate-400">
            Let&apos;s build it.
          </span>
        </div>

        <span className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#f7f5ef] py-2.5 text-[11.5px] font-bold text-[#08090d] shadow-sm transition-all duration-200 group-hover:bg-white group-hover:scale-[1.02]">
          Book a 30-min call
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  );
}
