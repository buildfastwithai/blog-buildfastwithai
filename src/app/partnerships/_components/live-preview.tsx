"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Item = {
  c: string;
  tag: string;
  slug: string;
  title: string;
  who: string;
  fit: string[];
  place: ReactNode;
};

const TAB_COLORS: Record<string, string> = {
  c1: "#226192",
  c2: "#141C28",
  c3: "#226192",
  c4: "#141C28",
  c5: "#226192",
  c6: "#141C28",
};

const Lines = ({ widths }: { widths: number[] }) => (
  <div className="lp-lines">
    {widths.map((w, i) => (
      <div key={i} className={`m-line w${w}`} />
    ))}
  </div>
);

const ITEMS: Item[] = [
  {
    c: "c1",
    tag: "Daily AI news",
    slug: "why-ai-stocks-are-falling",
    title: "Why AI Stocks Are Falling: CoreWeave Bonds Hit 14.5%",
    who: "Our highest-volume, fastest-moving traffic: readers checking the day's launches, funding and news.",
    fit: ["In-blog CTA", "X promotion"],
    place: (
      <div className="p-cta">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="p-logo"
          src="https://www.google.com/s2/favicons?domain=buildfastwithai.com&sz=128"
          alt="Build Fast with AI logo"
          width={42}
          height={42}
        />
        <div>
          <b>Join FDE</b>
          <small>Forward Deployed Crash Course</small>
        </div>
        <span className="p-btn">Join now &rarr;</span>
      </div>
    ),
  },
  {
    c: "c2",
    tag: "Model reviews",
    slug: "claude-haiku-5-5-review",
    title: "Claude Haiku 5.5 Review (2026): Speed, Cost & API",
    who: "Developers comparing models and tools before they commit to building with one.",
    fit: ["Tool review", "Contextual mention"],
    place: (
      <div className="p-review">
        <span className="p-score">8.6</span>
        <div>
          <b>Nimbus AI, tested hands-on</b>
          <small>Verdict: strong pick for agent workflows</small>
        </div>
        <div className="p-bars">
          <span>Ease of use<i style={{ ["--v" as string]: "88%" }} /></span>
          <span>Output quality<i style={{ ["--v" as string]: "82%" }} /></span>
          <span>Value<i style={{ ["--v" as string]: "74%" }} /></span>
        </div>
      </div>
    ),
  },
  {
    c: "c3",
    tag: "Rankings & comparisons",
    slug: "safest-ai-models-for-agents",
    title: "Which AI Model Is Safest for Agents? 27 Models Ranked",
    who: "Buyers building a shortlist. Ranked lists are where tools get discovered and compared.",
    fit: ["Roundup slot", "Contextual mention"],
    place: (
      <ol className="p-rank">
        <li><em>1</em>Tool A<small>9.4</small></li>
        <li className="me"><em>2</em>Nimbus AI<small>9.1</small></li>
        <li><em>3</em>Tool C<small>8.9</small></li>
      </ol>
    ),
  },
  {
    c: "c4",
    tag: "Prompt packs",
    slug: "ai-background-change-prompts",
    title: "100 Best AI Background Change Prompts 2026 (Copy-Paste)",
    who: "Creators and marketers with strong search demand and long time on page.",
    fit: ["In-blog CTA", "Sponsored article"],
    place: (
      <div className="p-banner">
        <div>
          <b>Run all 100 prompts in Nimbus AI</b>
          <small>One click, no setup, free trial</small>
        </div>
        <span className="p-btn">Try it &rarr;</span>
      </div>
    ),
  },
  {
    c: "c5",
    tag: "Guides & careers",
    slug: "forward-deployed-engineer-skills",
    title: "Forward Deployed Engineer Skills You Need in 2026",
    who: "Engineers and AI learners reading step-by-step guides end to end.",
    fit: ["Sponsored article", "Guest post"],
    place: (
      <div className="p-by">
        <span className="p-av">NA</span>
        <div>
          <b>In partnership with Nimbus</b>
          <small>Written by Build Fast with AI Editorial</small>
        </div>
        <span className="p-flag">Sponsored</span>
      </div>
    ),
  },
  {
    c: "c6",
    tag: "Analysis",
    slug: "ai-agents-code-output",
    title: "AI Agents Wrote 30% More Code. Shipped Output Didn't Move",
    who: "Founders and engineering leads. Data-led takes that travel furthest on X.",
    fit: ["X promotion", "Content package"],
    place: (
      <div className="p-x">
        <div className="xh">
          <span className="p-av" style={{ width: 30, height: 30 }}>B</span>
          <div>
            <b>Build Fast with AI</b>
            <br />
            <small>@buildfastwithai</small>
          </div>
          <span>&#120143;</span>
        </div>
        <p>Agents wrote 30% more code. Output didn&apos;t move. Here&apos;s what Nimbus AI does differently &#8595;</p>
        <div className="xs"><span>&#9825; Likes</span><span>&#8634; Reposts</span><span>Views</span></div>
      </div>
    ),
  },
];

export function LivePreview() {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const d = ITEMS[cur];

  // Pause while off screen or when the visitor prefers reduced motion.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPaused(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => setPaused(!e.isIntersecting)),
      { threshold: 0.25 },
    );
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const tabs = tabsRef.current;
    const active = tabs?.children[cur] as HTMLElement | undefined;
    if (tabs && active && tabs.scrollWidth > tabs.clientWidth) {
      tabs.scrollTo({ left: active.offsetLeft - 16, behavior: "smooth" });
    }
  }, [cur]);

  return (
    <div
      ref={rootRef}
      className={`lp ${d.c}${paused ? " paused" : ""}`}
      id="lp"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="lp-tabs" role="tablist" aria-label="Content formats" ref={tabsRef}>
        {ITEMS.map((it, i) => (
          <button
            key={it.slug}
            type="button"
            role="tab"
            aria-selected={i === cur}
            className={`lp-tab${i === cur ? " on" : ""}`}
            style={{ ["--tc" as string]: TAB_COLORS[it.c] }}
            onClick={() => setCur(i)}
          >
            <span className="t-n">0{i + 1}</span>
            <b>{it.tag}</b>
            <span className="t-h">{it.title}</span>
            <span
              className="t-bar"
              onAnimationEnd={() => i === cur && setCur((i + 1) % ITEMS.length)}
            />
          </button>
        ))}
      </div>

      <div className="lp-stage" ref={stageRef}>
        <div className="lp-win">
          <div className="lp-bar">
            <i /><i /><i />
            <span className="lp-url">
              blog.buildfastwithai.com/<b>{d.slug}</b>
            </span>
          </div>
          <div className="lp-body" aria-live="polite" key={d.slug}>
            <span className="lp-tag">{d.tag}</span>
            <h4 className="lp-h">
              {d.title.split(" ").map((w, i) => (
                <span key={i}>
                  <span className="w">
                    <span style={{ animationDelay: `${i * 0.045}s` }}>{w}</span>
                  </span>{" "}
                </span>
              ))}
            </h4>
            <div className="lp-meta">5 MIN READ &middot; BUILD FAST WITH AI</div>
            <Lines widths={[95, 85, 70]} />
            <div className="lp-place">{d.place}</div>
            <Lines widths={[90, 80, 60]} />
          </div>
        </div>
        <div className="lp-foot">
          <div>
            <span className="lp-k">Who reads it</span>
            <p className="lp-who">{d.who}</p>
          </div>
          <div>
            <span className="lp-k">Best fit</span>
            <div className="lp-fit">
              {d.fit.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
          </div>
          <span className="lp-count">
            0{cur + 1} <small>/ 0{ITEMS.length}</small>
          </span>
        </div>
      </div>
    </div>
  );
}
