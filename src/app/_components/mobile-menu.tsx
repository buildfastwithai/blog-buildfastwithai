"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import {
  BookOpen,
  Bot,
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  Gauge,
  Home,
  Layers,
  LogIn,
  LogOut,
  Newspaper,
  Presentation,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import Logo from "@/components/header/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { UserAvatar, useSignOut } from "@/components/user-menu";
import { useUser } from "@/hooks/use-user";
import useLoginForm from "@/hooks/user-login-form";
import { cn } from "@/lib/utils";
import { mainSiteUrl } from "@/lib/urls";

type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  event: string;
  external?: boolean;
};

const UTM = "?utm_source=blog_mobile_menu&utm_medium=navbar";

// Blog-internal pages — served from this domain.
const BROWSE: NavItem[] = [
  { href: "/", label: "Latest", icon: Home, event: "blog_menu_home_clicked" },
  { href: "/all", label: "All blogs", icon: Newspaper, event: "blog_menu_all_blogs_clicked" },
];

// Programs and tools — on the main site.
const PROGRAMS: NavItem[] = [
  {
    href: mainSiteUrl(`/agentic-ai${UTM}`),
    label: "Agentic AI Launchpad",
    description: "6-week cohort · build agents",
    icon: Bot,
    event: "blog_menu_agentic_clicked",
    external: true,
  },
  {
    href: mainSiteUrl(`/claude${UTM}`),
    label: "Claude Mastery",
    description: "Cowork & Code cohort",
    icon: Sparkles,
    event: "blog_menu_claude_clicked",
    external: true,
  },
  {
    href: mainSiteUrl(`/ai-workshops${UTM}`),
    label: "Free AI Workshops",
    description: "Live sessions, recordings included",
    icon: Presentation,
    event: "blog_menu_workshops_clicked",
    external: true,
  },
  {
    href: mainSiteUrl(`/corporate-training${UTM}`),
    label: "Corporate Training",
    description: "Upskill your team",
    icon: Briefcase,
    event: "blog_menu_corporate_clicked",
    external: true,
  },
];

const TOOLS: NavItem[] = [
  { href: mainSiteUrl(`/ai-tools${UTM}`), label: "AI Tools Library", icon: Wrench, event: "blog_menu_ai_tools_clicked", external: true },
  { href: mainSiteUrl(`/tools/prompt-library${UTM}`), label: "Prompt Library", icon: BookOpen, event: "blog_menu_prompt_library_clicked", external: true },
  { href: mainSiteUrl(`/tools/ai-readiness${UTM}`), label: "AI Readiness Check", icon: ClipboardCheck, event: "blog_menu_ai_readiness_clicked", external: true },
  { href: mainSiteUrl(`/vibe-check${UTM}`), label: "Vibe Check", icon: Gauge, event: "blog_menu_vibe_check_clicked", external: true },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function MobileMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const posthog = usePostHog();
  const { data: user } = useUser();
  const loginForm = useLoginForm();
  const { signOut, signingOut } = useSignOut();

  const close = () => onOpenChange(false);

  const track = (item: NavItem) => {
    posthog?.capture(item.event, { link_href: item.href });
    close();
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = !item.external && pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={item.external ? false : undefined}
        onClick={() => track(item)}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
          active
            ? "bg-primary/10 text-foreground"
            : "text-foreground hover:bg-muted",
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors group-hover:text-primary",
            active && "border-primary/30 text-primary",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium leading-tight">
            {item.label}
          </span>
          {item.description && (
            <span className="block truncate text-xs text-muted-foreground">
              {item.description}
            </span>
          )}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
      </Link>
    );
  };

  const signedIn = !!user && !user.is_anonymous;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* z above the sticky header (z-[100]); p-0 so we own the layout */}
      <SheetContent
        side="left"
        className="z-[150] flex w-[86%] max-w-sm flex-col gap-0 bg-background p-0"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>

        {/* Header */}
        <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-border px-4">
          <div onClick={close}>
            <Logo />
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
          <SectionLabel>Browse</SectionLabel>
          <div className="flex flex-col gap-0.5">{BROWSE.map(renderItem)}</div>

          <SectionLabel>Programs</SectionLabel>
          <div className="flex flex-col gap-0.5">{PROGRAMS.map(renderItem)}</div>

          <SectionLabel>Free tools</SectionLabel>
          <div className="flex flex-col gap-0.5">{TOOLS.map(renderItem)}</div>
        </nav>

        {/* Footer: account + theme */}
        <div className="shrink-0 border-t border-border bg-muted/40 px-4 py-3">
          {signedIn ? (
            <div className="flex items-center gap-3">
              <UserAvatar user={user} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.user_metadata?.full_name || "Signed in"}
                </p>
                {user.email && (
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={signingOut}
                onClick={async () => {
                  await signOut("blog_mobile_menu");
                  close();
                }}
                aria-label="Log out"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                posthog?.capture("blog_menu_sign_in_clicked");
                close();
                loginForm.onOpen();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <LogIn className="h-4 w-4" />
              Sign in / Create account
            </button>
          )}

          <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Appearance
            </span>
            <div onClick={() => posthog?.capture("blog_navbar_theme_toggled")}>
              <ThemeToggle className="h-8 w-8 bg-background" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
