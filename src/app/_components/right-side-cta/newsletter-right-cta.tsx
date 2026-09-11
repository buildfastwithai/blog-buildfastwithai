"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import { usePostHog } from "posthog-js/react";

/**
 * The sidebar twin of the inline newsletter CTA. Same brand slab and the same
 * --cta-news-* tokens, so the two read as one product rather than two designs.
 * Copy is cut to the bone: eyebrow, two-word headline, five-word promise.
 */

export function NewsletterRightCta() {
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
      setMessage({ type: "error", text: "Enter your email" });
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
        setMessage({ type: "success", text: "You're subscribed" });
        posthog.capture("blog_sidebar_newsletter_subscribed", {
          location: "sidebar",
        });
        setEmail("");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Try again" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribed = message?.type === "success";

  return (
    <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(140deg,var(--cta-news-block)_0%,var(--cta-news-block-2)_100%)] p-4 shadow-[var(--shadow-md)]">
      {/* corner glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[color-mix(in_oklab,var(--cta-news-art-lift)_45%,transparent)] blur-2xl"
      />

      <div className="relative z-10">
        <p className="m-0 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--cta-news-on-block-soft)]">
          <Mail className="h-3 w-3" />
          Newsletter
        </p>
        <p className="m-0 mt-2 font-serif text-[19px] font-bold leading-none tracking-tight text-[var(--cta-news-on-block)]">
          Stay ahead
        </p>
        <p className="m-0 mt-1.5 text-[10.5px] leading-snug text-[var(--cta-news-on-block-soft)]">
          AI tools and tips. No spam.
        </p>

        {subscribed ? (
          <p className="m-0 mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-white/15 py-2.5 text-[11px] font-bold text-[var(--cta-news-on-block)]">
            <Check className="h-3.5 w-3.5" />
            {message?.text}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="sidebar-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="sidebar-newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-white/35 bg-white/10 px-3 py-2 text-[11px] text-[var(--cta-news-on-block)] placeholder:text-[color-mix(in_oklab,var(--cta-news-on-block)_65%,transparent)] focus:border-white/70 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[var(--cta-news-on-block)] py-2 text-[11px] font-bold text-[var(--cta-news-block)] transition-opacity duration-200 hover:opacity-90 disabled:opacity-70"
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}

        {message?.type === "error" && (
          <p
            role="status"
            className="m-0 mt-2 text-center text-[10px] font-medium text-[var(--cta-news-on-block-soft)]"
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
