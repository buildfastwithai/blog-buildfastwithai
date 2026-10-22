"use client";

import { useEffect, useState } from "react";
import {
  istToMs,
  isLeftCtaActive,
  LEFT_CTAS,
  type LeftCta,
} from "./left-cta-schedule";

// The left column also holds the table of contents, so cap how many promos stack.
const MAX_VISIBLE = 2;

// setTimeout overflows (and fires immediately) beyond ~24.8 days.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Renders the left-sidebar CTAs whose window (see left-cta-schedule.tsx)
 * contains the current time.
 *
 * Blog pages are statically cached, so the schedule is evaluated in the
 * browser: the first paint has no CTA, then the active ones appear, and each
 * disappears on its own if the reader keeps the tab open past its end time.
 */
export function LeftSideCta() {
  const [active, setActive] = useState<LeftCta[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      const now = Date.now();
      setActive(LEFT_CTAS.filter((cta) => isLeftCtaActive(cta, now)).slice(0, MAX_VISIBLE));

      // Wake at the next start or end so CTAs switch without a reload.
      const nextBoundary = LEFT_CTAS.flatMap((cta) => [cta.startsAt, cta.endsAt])
        .map(istToMs)
        .filter((time) => time > now)
        .sort((a, b) => a - b)[0];

      if (nextBoundary !== undefined) {
        timer = setTimeout(update, Math.min(nextBoundary - now + 500, MAX_TIMEOUT_MS));
      }
    };

    update();
    return () => clearTimeout(timer);
  }, []);

  if (active.length === 0) return null;

  return (
    <div className="flex max-h-[calc(100vh-11rem)] flex-col gap-4 overflow-y-auto [&>*]:shrink-0">
      {active.map(({ id, component: Cta }) => (
        <Cta key={id} />
      ))}
    </div>
  );
}
