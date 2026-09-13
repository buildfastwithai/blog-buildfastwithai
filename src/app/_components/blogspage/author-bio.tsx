import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Linkedin, Twitter, Globe, ArrowUpRight } from "lucide-react";

interface AuthorBioProps {
  authorName?: string | null;
  authorUrl?: string | null;
}

export default function AuthorBio({
  authorName = "Satvik Paramkusam",
  authorUrl = "https://www.linkedin.com/in/satvikparamkusham/",
}: AuthorBioProps) {
  const name = authorName || "Satvik Paramkusam";
  const isFounder = name.toLowerCase().includes("satvik");

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-8 my-10 shadow-sm transition-all hover:border-primary/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        {/* Avatar */}
        <Link
          href="/author/satvik-paramkusam"
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 shrink-0 hover:scale-105 transition-transform shadow-md"
        >
          <Image
            src="/authors/satvik.png"
            alt={name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Written by
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                <Link
                  href="/author/satvik-paramkusam"
                  className="hover:text-primary transition-colors"
                >
                  {name}
                </Link>
              </h3>
            </div>

            {/* Social / profile links */}
            <div className="flex items-center gap-2">
              <Link
                href="https://www.linkedin.com/company/build-fast-with-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link
                href="https://x.com/buildfastwithai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X profile"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.buildfastwithai.com/about"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Author Website"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Globe className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {isFounder
              ? "Founder at Build Fast with AI. Passionate about AI engineering, agentic workflows, and teaching developers how to build production-grade AI systems."
              : "AI practitioner and technical writer at Build Fast with AI, covering state-of-the-art AI models, frameworks, and practical developer tutorials."}
          </p>
        </div>
      </div>
    </div>
  );
}
