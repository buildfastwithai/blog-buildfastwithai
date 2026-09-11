"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle } from "lucide-react";

const API_URL = "/api/blogs/subscribe";

export default function NewsletterSidebarCTA() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMessage(null);
      setEmail("");
    }
    setOpen(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setEmail("");
        setTimeout(() => {
          setMessage(null);
          setOpen(false);
        }, 2500);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to subscribe. Please try again.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mt-6 p-5 rounded-xl bg-muted border border-border">
        <h4 className="font-semibold text-base mb-1">Subscribe to updates</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Get the latest insights directly in your inbox.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => setOpen(true)}
          className="w-full"
        >
          Join Newsletter
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Subscribe to updates</DialogTitle>
            <DialogDescription>
              Get the latest insights directly in your inbox. No spam, unsubscribe anytime.
            </DialogDescription>
          </DialogHeader>

          {message && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg text-sm font-medium border ${
                message.type === "success"
                  ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {!message?.type || message.type !== "success" ? (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@gamil.com"
                disabled={isLoading}
                autoComplete="email"
                className="h-10"
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
