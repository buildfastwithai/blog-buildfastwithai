"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { usePostHog } from "posthog-js/react";

/**
 * Layout: "poster block" - a solid brand slab carrying the headline, brief and
 * subscribe row, with an illustration panel bleeding off the right.
 * Palette: --cta-news-*, the site indigo. Light and dark both defined.
 *
 * Sizing: `container-type: inline-size`. The slab is 68cqw wide with 4cqw
 * padding, so 60cqw is usable; at 9.3cqw the longer line ("DATE WITH AI",
 * 6.45em) fills it exactly and the shorter sits at 87%. Both lines are
 * `whitespace-nowrap`. Re-measure if the wording changes.
 */

/** Stylised paper plane, standing in for the reference's mascot. */
function NewsletterArt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 260 300"
      className="pointer-events-none absolute bottom-0 right-0 h-full w-auto"
    >
      <defs>
        <linearGradient id="news-body" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="var(--cta-news-art-lift)" />
          <stop offset="100%" stopColor="var(--cta-news-block)" />
        </linearGradient>
        <linearGradient id="news-fold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cta-news-block)" />
          <stop offset="100%" stopColor="var(--cta-news-art-deep)" />
        </linearGradient>
      </defs>

      {/* vapour trails */}
      <g
        fill="none"
        stroke="var(--cta-news-art-lift)"
        strokeOpacity="0.35"
        strokeWidth="4"
        strokeLinecap="round"
      >
        <path d="M8 244 C60 236 96 218 128 190" />
        <path d="M30 276 C92 268 140 244 178 206" />
      </g>

      {/* plane: near wing, body, far wing */}
      <path d="M236 40 L96 150 L150 168 Z" fill="url(#news-body)" />
      <path d="M236 40 L150 168 L176 232 Z" fill="url(#news-fold)" />
      <path
        d="M236 40 L150 168 L150 168 L128 196 L134 158 Z"
        fill="var(--cta-news-art-deep)"
        fillOpacity="0.55"
      />
    </svg>
  );
}

export default function NewsletterCTA() {
  const posthog = usePostHog();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/blogs/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        posthog.capture("blog_newsletter_subscribed", {
          location: "blog_details",
        });
        setEmail("");
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to subscribe. Please try again.",
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="newsletter"
      style={{ containerType: "inline-size" }}
      className="not-prose relative mx-auto my-10 max-w-4xl overflow-hidden rounded-[20px] bg-[var(--cta-news-panel)] shadow-[var(--shadow-lg)]"
    >
      {/* illustration panel, sitting behind the slab */}
      <div className="cta-news-art absolute inset-y-0 right-0 w-[36cqw]">
        <NewsletterArt />
      </div>

      {/* ── Brand slab ─────────────────────────────────────────────────── */}
      <div className="cta-news-slab relative bg-[linear-gradient(135deg,var(--cta-news-block)_0%,var(--cta-news-block-2)_100%)] p-[max(18px,4cqw)]">
        <h2 className="m-0 text-[max(28px,9.3cqw)] font-extrabold uppercase leading-[0.88] tracking-[-0.035em] text-[var(--cta-news-on-block)]">
          <span className="block whitespace-nowrap">Stay up to</span>
          <span className="block whitespace-nowrap">Date with AI</span>
        </h2>

        <p className="m-0 mt-[3cqw] font-serif text-[max(11px,1.9cqw)] font-bold text-[var(--cta-news-on-block)]">
          Subscribe for future updates
        </p>
        <p className="m-0 mt-[1cqw] max-w-[46ch] text-[max(11.5px,1.65cqw)] leading-snug text-[var(--cta-news-on-block-soft)]">
          The tips, tools and templates we actually use. No spam.
        </p>

        {message && (
          <div
            className="mt-[2.5cqw] flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-[max(10.5px,1.6cqw)] font-medium text-[var(--cta-news-on-block)]"
            role="status"
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="cta-news-form mt-[3cqw]"
        >
          <label htmlFor="blog-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="blog-newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="YOUR EMAIL ADDRESS..."
            required
            disabled={isLoading}
            className="min-w-0 flex-1 border-2 border-[var(--cta-news-on-block)] bg-transparent px-[max(12px,2.5cqw)] py-[max(10px,1.8cqw)] text-[max(11px,1.85cqw)] font-bold uppercase tracking-wide text-[var(--cta-news-on-block)] placeholder:text-[color-mix(in_oklab,var(--cta-news-on-block)_75%,transparent)] focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="shrink-0 border-2 border-[var(--cta-news-on-block)] bg-[var(--cta-news-on-block)] px-[max(16px,3cqw)] py-[max(10px,1.8cqw)] text-[max(11px,1.85cqw)] font-extrabold uppercase tracking-wide text-[var(--cta-news-block)] transition-opacity duration-200 hover:opacity-90 disabled:opacity-70"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
