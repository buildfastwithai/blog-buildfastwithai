"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

type SlideProps = Record<string, unknown>;

/**
 * Endless peek carousel. The active card fills ~70% of the width and the next
 * one shows at the edge; after the last card comes the first again.
 *
 * Slides stay server-rendered. After mount the track holds three copies of the
 * list (clones are inert and hidden from assistive tech); when the scroll
 * settles in an outer copy it jumps, unseen, to the same card in the middle
 * copy, so the track never reaches an end. Before mount (and for crawlers)
 * only the real slides exist.
 */
export function ServicesCarousel({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children).filter(isValidElement) as ReactElement<SlideProps>[];
  const n = slides.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const leftOf = (el: HTMLElement, i: number) =>
    (el.children[i] as HTMLElement).offsetLeft - el.offsetLeft;

  const nearest = useCallback((el: HTMLElement) => {
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < el.children.length; i++) {
      const dist = Math.abs(leftOf(el, i) - el.scrollLeft);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    }
    return best;
  }, []);

  // Jump without animation or snapping.
  const jumpTo = useCallback((el: HTMLElement, left: number) => {
    el.style.scrollSnapType = "none";
    el.scrollLeft = left;
    requestAnimationFrame(() => {
      el.style.scrollSnapType = "";
    });
  }, []);

  // Once the clones exist, start on the real first card (middle copy).
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!ready || !el || el.children.length !== n * 3) return;
    jumpTo(el, leftOf(el, n));
  }, [ready, n, jumpTo]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let settle = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const c = nearest(el);
        setActive(((c % n) + n) % n);
      });
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (el.children.length !== n * 3) return;
        const c = nearest(el);
        if (c < n || c >= n * 2) jumpTo(el, leftOf(el, (c % n) + n));
      }, 130);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [n, nearest, jumpTo]);

  const step = (delta: number) => {
    const el = trackRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(el.children.length - 1, nearest(el) + delta));
    el.scrollTo({ left: leftOf(el, target), behavior: "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  const real = slides.map((s, i) => cloneElement(s, { key: `r-${i}`, "data-i": i }));
  const clones = (tag: string) =>
    slides.map((s, i) =>
      cloneElement(s, {
        key: `${tag}-${i}`,
        id: undefined,
        inert: true,
        "aria-hidden": true,
        "data-i": i,
      }),
    );

  return (
    <div
      className="svc-car"
      role="group"
      aria-roledescription="carousel"
      aria-label="Partnership services"
      onKeyDown={onKeyDown}
    >
      <div className="svc-stage">
        <div className="svc-track" ref={trackRef} data-active={active} tabIndex={0}>
          {ready ? [...clones("a"), ...real, ...clones("c")] : real}
        </div>
        <button type="button" className="svc-nav prev" aria-label="Previous service" onClick={() => step(-1)}>
          &larr;
        </button>
        <button type="button" className="svc-nav next" aria-label="Next service" onClick={() => step(1)}>
          &rarr;
        </button>
      </div>
    </div>
  );
}
