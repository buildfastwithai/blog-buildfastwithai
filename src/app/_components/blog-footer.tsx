"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mainSiteUrl } from "@/lib/urls";

// Plain server-rendered links on every blog page: the blog had no footer, so
// pages linked to very little beyond their own article. These give crawlers a
// path to the topic hubs and best posts from anywhere, and link back to the
// main site.
const TOPICS = [
  { name: "Claude AI", href: "/claude-ai" },
  { name: "Best AI Models", href: "/best-ai-models" },
  { name: "AI Coding Tools", href: "/ai-coding-tools" },
  { name: "AI Agent Frameworks", href: "/ai-agent-frameworks" },
  { name: "Agentic AI", href: "/agentic-ai" },
  { name: "Open-Source LLMs", href: "/open-source-llms" },
  { name: "RAG & Vector Databases", href: "/rag-vector-databases" },
  { name: "AI Industry News", href: "/ai-industry-news-trends" },
];

const POPULAR = [
  { name: "100 Best ChatGPT Photo Editing Prompts", href: "/chatgpt-photo-editing-prompts" },
  { name: "75 Best ChatGPT Images 2.5 Prompts", href: "/75-best-chatgpt-images-2-5-prompts-2026" },
  { name: "100 Best AI Video Prompts", href: "/best-ai-video-prompts" },
  { name: "Best AI Models 2026, Tested", href: "/best-ai-models-2026-tested" },
  { name: "Claude AI Complete Guide", href: "/claude-ai-complete-guide-2026" },
  { name: "What Is MCP?", href: "/what-is-model-context-protocol-mcp" },
];

const COMPANY = [
  { name: "Build Fast with AI", href: mainSiteUrl("/") },
  { name: "AI Workshops", href: mainSiteUrl("/ai-workshops") },
  { name: "Corporate Training", href: mainSiteUrl("/corporate-training") },
  { name: "FDE Program", href: mainSiteUrl("/fde") },
  { name: "Partner with Us", href: "/partnerships" },
  { name: "Contact", href: mainSiteUrl("/contact") },
];

function Column({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {link.href.startsWith("http") ? (
              <a
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.name}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BlogFooter() {
  const pathname = usePathname();
  // /partnerships brings its own footer; auth pages are not content pages.
  if (pathname.startsWith("/partnerships") || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 pt-12">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Partner with Build Fast with AI
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Guest posts, sponsored articles, tool reviews and in-blog CTAs.
              See what we offer and get in touch.
            </p>
          </div>
          <Link
            href="/partnerships"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "shrink-0 font-semibold",
            )}
          >
            Partner with us
          </Link>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <Column title="Topics" links={TOPICS} />
        <Column title="Popular guides" links={POPULAR} />
        <Column title="Build Fast with AI" links={COMPANY} />
      </div>
      <div className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Intellify Edventures Private Limited. All
        rights reserved.
      </div>
    </footer>
  );
}
