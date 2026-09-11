"use client";

import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Link as LinkIcon, Check, MessageCircle, ArrowUp } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { usePostHog } from "posthog-js/react";

interface ShareButtonsProps {
  title: string;
  url?: string;
  /** If true, renders as a vertical sticky floating pill (desktop left rail). */
  variant?: "floating" | "inline";
}

export function ShareButtons({ title, url, variant = "inline" }: ShareButtonsProps) {
  const posthog = usePostHog();
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return url || window.location.href;
    }
    return "";
  };

  const currentUrl = getShareUrl();

  const handleShareTwitter = () => {
    posthog.capture("blog_shared", {
      network: "twitter",
      blog_title: title,
    });
    const text = encodeURIComponent(title);
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${text}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedin = () => {
    posthog.capture("blog_shared", {
      network: "linkedin",
      blog_title: title,
    });
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    posthog.capture("blog_shared", {
      network: "copy_link",
      blog_title: title,
    });
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Blog post link copied to clipboard.",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleScrollToComments = () => {
    const el = document.getElementById("blog-comments");
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (variant === "floating") {
    return (
      <div className="flex flex-col items-center gap-1 p-2 rounded-2xl border border-border bg-background/80 backdrop-blur-sm shadow-sm">
       
        <span className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase py-1 select-none">
          Share
        </span>

        <button
          onClick={handleShareTwitter}
          title="Share on X / Twitter"
          className={cn(
            "group flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Twitter className="w-4 h-4" />
        </button>

        <button
          onClick={handleShareLinkedin}
          title="Share on LinkedIn"
          className={cn(
            "group flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Linkedin className="w-4 h-4" />
        </button>

        <button
          onClick={handleCopyLink}
          title="Copy link"
          className={cn(
            "group flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <LinkIcon className="w-4 h-4" />
          )}
        </button>

     
        <div className="w-5 h-px bg-border my-1" />

        <button
          onClick={handleScrollToComments}
          title="Jump to comments"
          className={cn(
            "group flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        <button
          onClick={handleScrollToTop}
          title="Back to top"
          className={cn(
            "group flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Inline variant (mobile)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground mr-1">Share:</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleShareTwitter}
        className="text-muted-foreground hover:text-foreground hover:bg-muted"
        title="Share on X / Twitter"
      >
        <Twitter className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleShareLinkedin}
        className="text-muted-foreground hover:text-foreground hover:bg-muted"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopyLink}
        className="text-muted-foreground hover:text-foreground hover:bg-muted"
        title="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleScrollToComments}
        className="text-muted-foreground hover:text-foreground hover:bg-muted"
        title="Jump to comments"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
    </div>
  );
}
