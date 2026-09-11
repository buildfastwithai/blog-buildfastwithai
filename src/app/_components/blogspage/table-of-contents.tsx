"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePostHog } from "posthog-js/react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const posthog = usePostHog();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 },
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    const item = items.find(i => i.id === id);

    if (element) {
      posthog.capture("blog_toc_clicked", {
        heading_text: item?.text,
        heading_id: id,
        heading_level: item?.level,
      });

      const offset = 100; // Header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="text-[12px]">
      <ul className="relative flex flex-col">
        {items.map((item, index) => (
          <li key={item.id} className={cn(
            "relative",
            index !== items.length - 1 && "border-b border-border/60"
          )}>
            <button
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                "group relative py-3.5 pr-4 text-left transition-all duration-200 block w-full leading-relaxed",
                activeId === item.id
                  ? "text-foreground font-bold opacity-100"
                  : "text-foreground/40 font-medium hover:text-foreground hover:opacity-80",
                item.level === 3 && "pl-5"
              )}
            >
              {item.text}
              {activeId === item.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
