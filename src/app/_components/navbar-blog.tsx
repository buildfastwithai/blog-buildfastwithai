"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Logo from "@/components/header/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import MobileMenu from "./mobile-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { usePostHog } from "posthog-js/react";
import { mainSiteUrl } from "@/lib/urls";

// Programs live on the main site; only "All blogs" is served from this domain.
const AGENTIC_AI_HREF = mainSiteUrl("/agentic-ai");

const BLOG_NAV_LINKS = [
  { href: mainSiteUrl("/ai-workshops"), label: "AI Workshops", eventName: "blog_navbar_ai_workshops_clicked" },
  { href: "/all", label: "All blogs", eventName: "blog_navbar_all_blogs_clicked" },
] as const;

export default function NavbarBlog() {
  const pathname = usePathname();
  const posthog = usePostHog();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (eventName: string, href: string) => {
    posthog.capture(eventName, {
      link_href: href,
    });
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "top-0 sticky z-[100] w-full bg-background shadow-sm shadow-muted",
        )}
      >
        <div className="max-w-[88rem] h-[4.5rem] w-full mx-auto flex justify-between items-center px-4 sm:px-8">
          <div onClick={() => posthog.capture("blog_navbar_logo_clicked")}>
            <Logo />
          </div>

          {/* Desktop: nav links + theme toggle */}
          <div className="hidden lg:flex items-center gap-6">
            {BLOG_NAV_LINKS.map(({ href, label, eventName }) => (
              <Link
                key={href}
                href={href}
                onClick={() => handleLinkClick(eventName, href)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === href
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              href={AGENTIC_AI_HREF}
              prefetch={false}
              onClick={() => handleLinkClick("blog_navbar_agentic_launchpad_clicked", AGENTIC_AI_HREF)}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "font-semibold bg-primary text-primary-foreground shadow-sm hover:scale-[0.98] transition-transform"
              )}
            >
              Agentic AI Launchpad
            </Link>
            <div onClick={() => posthog.capture("blog_navbar_theme_toggled")}>
              <ThemeToggle className="bg-background" />
            </div>
            {/* Only renders when signed in */}
            <UserMenu />
          </div>

          {/* Mobile: theme toggle + account + menu button. The Launchpad CTA
              lives inside the menu on small screens — the bar is too narrow
              for a button, avatar, toggle and hamburger side by side. */}
          <div className="flex items-center gap-2 lg:hidden">
            <div onClick={() => posthog.capture("blog_navbar_theme_toggled")}>
              <ThemeToggle className="bg-background animate-none h-8 w-8" />
            </div>
            <UserMenu className="h-8 w-8" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                posthog.capture("blog_navbar_mobile_menu_clicked");
                setMobileOpen(true);
              }}
              aria-label="Open menu"
            >
              <AlignRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}
