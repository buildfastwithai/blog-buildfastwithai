"use client";

import { useEffect } from "react";

function countUp(el: HTMLElement) {
  const end = parseFloat(el.dataset.count ?? "0");
  const dec = Number(el.dataset.dec ?? 0);
  const dur = 1600;
  let t0: number | null = null;
  const tick = (t: number) => {
    if (t0 === null) t0 = t;
    const p = Math.min((t - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = (end * e).toFixed(dec);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Mounted once per page. Adds `.in` to revealable elements as they scroll into
 * view, runs the stat count-up, and highlights the active table-of-contents
 * link. Renders nothing; all markup stays server-rendered.
 */
export function Reveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pp");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const el = en.target as HTMLElement;
          el.classList.add("in");
          if (!reduce) el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          io.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    root
      .querySelectorAll(".rv,.split,.steps,.kicker,.head")
      .forEach((el) => io.observe(el));

    const tocLinks = root.querySelectorAll<HTMLAnchorElement>(".toc a");
    const tio = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          tocLinks.forEach((a) =>
            a.classList.toggle("on", a.getAttribute("href") === `#${en.target.id}`),
          );
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    root.querySelectorAll(".blk[id]").forEach((b) => tio.observe(b));

    return () => {
      io.disconnect();
      tio.disconnect();
    };
  }, []);

  return null;
}
