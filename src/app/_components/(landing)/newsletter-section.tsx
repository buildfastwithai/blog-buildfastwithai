"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const PERKS = ["Weekly AI news", "Code tutorials", "New model breakdowns"];

const Newsletter = () => {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-12 lg:pb-16">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-lg)]">
        {/* Backdrop: soft primary wash + faint grid, both token-driven */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div className="mx-auto max-w-2xl text-center">
            {/* Icon badge */}
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
              <Mail className="h-5 w-5" />
            </div>

            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              Stay in the loop
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2.25rem] lg:leading-[1.15]">
              The AI newsletter for people who{" "}
              <span className="text-primary">build</span>
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              New models, hands-on tutorials and the tools worth your time —
              distilled into one email a week.
            </p>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 w-full max-w-md"
            >
              <div
                className={cn(
                  "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:border sm:border-border sm:bg-background sm:p-1.5 sm:shadow-sm sm:transition-shadow sm:focus-within:border-primary/50 sm:focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_15%,transparent)]",
                  message?.type === "error" && "sm:border-destructive/50",
                )}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-50 sm:h-10 sm:flex-1 sm:border-0 sm:bg-transparent sm:px-4 sm:focus:border-0"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subscribing…
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Status */}
              <div className="min-h-[1.5rem] mt-3" aria-live="polite">
                {message ? (
                  <p
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-medium",
                      message.type === "success"
                        ? "text-primary"
                        : "text-destructive",
                    )}
                  >
                    {message.type === "success" && (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {message.text}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Free forever. No spam — unsubscribe anytime.
                  </p>
                )}
              </div>
            </form>

            {/* Perks */}
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
              {PERKS.map((perk) => (
                <li key={perk} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
