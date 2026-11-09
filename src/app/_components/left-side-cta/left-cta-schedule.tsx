import type { ComponentType } from "react";
import { FdeClaudeLeftCta } from "./fde-claude-left-cta";
import { MasterClaudeCodeLeftCta } from "./master-claude-code-left-cta";
// import { FdeWorkshopLeftCta } from "./fde-workshop-left-cta"; // FDE Playbook 24 Oct 2026, ended
// import { HackathonLeftCta } from "./hackathon-left-cta"; // AI Build Challenge 2026, closed

export interface LeftCta {
  /** Unique key; also used as the React key. */
  id: string;
  component: ComponentType;
  /** "YYYY-MM-DD HH:mm" in IST. The CTA appears at this moment. */
  startsAt: string;
  /** "YYYY-MM-DD HH:mm" in IST. The CTA disappears at this moment. */
  endsAt: string;
}

/**
 * The blog's left-sidebar CTAs, shown by date.
 *
 * Every entry with `startsAt <= now < endsAt` is shown, in the order listed
 * (see MAX_VISIBLE in left-side-cta.tsx for how many fit at once). Entries with
 * different windows take turns; entries whose windows overlap show together.
 *
 * To add one:
 *   1. Create `<name>-left-cta.tsx` in this folder (copy fde-workshop-left-cta.tsx).
 *   2. Import it above and add an entry below with its dates.
 * Expired entries are never shown, so delete them whenever you like.
 *
 * A date that doesn't parse hides the CTA instead of showing it forever, so a
 * typo fails closed.
 */
export const LEFT_CTAS: LeftCta[] = [
  {
    id: "fde-claude-nov-2026",
    component: FdeClaudeLeftCta,
    // Workshop is Sat 14 Nov 2026, 7:30-9:00 PM IST (luma.com/zi091yal). Hide at 10 PM IST.
    startsAt: "2026-11-09 00:00",
    endsAt: "2026-11-14 22:00",
  },
  {
    id: "master-claude-code-nov-2026",
    component: MasterClaudeCodeLeftCta,
    // Paid workshop (₹99) is Sun 22 Nov 2026, 10:00-11:30 AM IST. Hide when it ends.
    startsAt: "2026-11-15 00:00",
    endsAt: "2026-11-22 11:30",
  },

  // Example: a CTA that only runs on 28 Oct.
  // {
  //   id: "next-promo-oct-28",
  //   component: NextPromoLeftCta,
  //   startsAt: "2026-10-28 00:00",
  //   endsAt: "2026-10-28 23:59",
  // },
];

/** Milliseconds since epoch for an "YYYY-MM-DD HH:mm" IST string; NaN if malformed. */
export function istToMs(value: string): number {
  return Date.parse(`${value.trim().replace(" ", "T")}:00+05:30`);
}

export function isLeftCtaActive(cta: LeftCta, now: number): boolean {
  return istToMs(cta.startsAt) <= now && now < istToMs(cta.endsAt);
}
