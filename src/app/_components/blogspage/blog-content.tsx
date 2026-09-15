"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { normalizeLegacyBlogHref } from "@/lib/urls";

// Lazy load heavy interactive components
const QuizContainer = dynamic(() => import("../quiz-container"), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
});

const AssessmentContainer = dynamic(
  () => import("../assessment-container").then((mod) => mod.AssessmentContainer),
  {
    loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  }
);

interface BlogContentProps {
  content: string;
  blogTitle?: string;
  onHeadingsChange?: (headings: any[]) => void;
  onActiveCtasChange?: (ctas: string[]) => void;
}


function normalizeLists(html: string): string {
  const hasBullets = /[•·‣▪◦\u2022\u00b7\u2023\u25aa\u25e6]|&bull;/.test(html);
  const hasNumbered = /<p[^>]*>\s*\d+[.)](?:&nbsp;|\s)/.test(html);
  if (!hasBullets && !hasNumbered) return html;

  let result = html;
  const listBlocks: string[] = [];
  result = result.replace(/<(?:ul|ol)[\s\S]*?<\/(?:ul|ol)>/gi, (match) => {
    const idx = listBlocks.push(match) - 1;
    return `\uFFFEL${idx}\uFFFE`;
  });

  const US = '\uFFFDu\uFFFD'; // ul-item start
  const UE = '\uFFFD/u\uFFFD'; // ul-item end
  const OS = '\uFFFDo\uFFFD'; // ol-item start
  const OE = '\uFFFD/o\uFFFD'; // ol-item end


  if (hasBullets) {
    result = result.replace(
      /<p[^>]*>(?:[•·‣▪◦\u2022\u00b7\u2023\u25aa\u25e6]|&bull;)((?:&nbsp;|\s)+)([\s\S]*?)<\/p>/gi,
      `${US}$2${UE}`
    );
  }

  if (hasNumbered) {
    result = result.replace(
      /<p[^>]*>\s*\d+[.)](?:&nbsp;|\s)+([\s\S]*?)<\/p>/gi,
      `${OS}$1${OE}`
    );
  }


  result = result.replace(
    new RegExp(`((?:${US}[\\s\\S]*?${UE}\\s*)+)`, 'g'),
    (match) => {
      const items = match.replace(
        new RegExp(`${US}([\\s\\S]*?)${UE}`, 'g'),
        '<li>$1</li>'
      );
      return `<ul>${items}</ul>`;
    }
  );

  result = result.replace(
    new RegExp(`((?:${OS}[\\s\\S]*?${OE}\\s*)+)`, 'g'),
    (match) => {
      const items = match.replace(
        new RegExp(`${OS}([\\s\\S]*?)${OE}`, 'g'),
        '<li>$1</li>'
      );
      return `<ol>${items}</ol>`;
    }
  );

  // ── 6. Restore the protected <ul>/<ol> blocks ─────────────────────────────
  result = result.replace(/\uFFFEL(\d+)\uFFFE/g, (_, i) => listBlocks[parseInt(i, 10)]);

  return result;
}


import { usePostHog } from "posthog-js/react";
import ClaudeCta from "../cta/claude-cta";
import AgenticCta from "../cta/agentic-cta";
import AiWorkshopCta from "../cta/ai-workshop-cta";
import CorporateTrainingCta from "../cta/corporate-training-cta";
import AiReadinessCta from "../cta/ai-readiness-cta";
import PromptLibraryCta from "../cta/prompt-library-cta";
import UnrotCta from "../cta/unrot-cta";
import AiToolsCta from "../cta/ai-tools-cta";
import VibeCheckCta from "../cta/vibe-check-cta";
import FdeCta from "../cta/fde-cta";
import NewsletterCTA from "../news-letter-cta";

export function BlogContent({ content, blogTitle, onHeadingsChange, onActiveCtasChange }: BlogContentProps) {
  const posthog = usePostHog();

  const { processedContent, headings } = useMemo(() => {
    if (!content) return { processedContent: "", headings: [] };


    const normalised = normalizeLists(content);

    // ── Step 1: add IDs to headings and extract TOC items ─────────────
    // We also convert any accidental h1 in content to h2 for SEO (only 1 H1 per page)
    const headingRegex =
      /<(h[1-3])(?:[^>]*id="([^"]*)")?(?:[^>]*)>(.*?)<\/\1>/gi;
    const extractedHeadings: any[] = [];
    let isFirstHeading = true;

    const newContent = normalised.replace(
      headingRegex,
      (serialized, tag, existingId, text) => {
        const plainText = text.replace(/<[^>]*>/g, "").trim();
        
        // Strip duplicate title heading if it matches the blog title
        if (isFirstHeading && blogTitle && plainText.toLowerCase() === blogTitle.toLowerCase().trim()) {
          isFirstHeading = false;
          return ""; // Strip duplicate heading
        }
        
        isFirstHeading = false;

        const slug =
          existingId ||
          plainText
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        let level = parseInt(tag.replace("h", ""));
        let actualTag = tag;

        // SEO: Convert H1 to H2
        if (level === 1) {
          level = 2;
          actualTag = "h2";
        }

        if (level === 2) {
          extractedHeadings.push({ id: slug, text: plainText, level });
        }

        return `<${actualTag} id="${slug}">${text}</${actualTag}>`;
      }
    );

    // ── Step 2: Optimize in-content images and external links for SEO ──
    const fallbackAlt = blogTitle ? `${blogTitle} illustration` : "Article illustration";
    const optimizedContent = newContent
      // Add loading="lazy", decoding="async", and alt fallback to <img>
      .replace(/<img\b([^>]*)>/gi, (match, attrs) => {
        let newAttrs = attrs;
        if (!/loading\s*=/i.test(newAttrs)) newAttrs += ' loading="lazy"';
        if (!/decoding\s*=/i.test(newAttrs)) newAttrs += ' decoding="async"';
        if (!/alt\s*=\s*["'][^"']+["']/i.test(newAttrs)) {
          if (/alt\s*=\s*["']\s*["']/i.test(newAttrs)) {
            newAttrs = newAttrs.replace(/alt\s*=\s*["']\s*["']/i, `alt="${fallbackAlt}"`);
          } else {
            newAttrs += ` alt="${fallbackAlt}"`;
          }
        }
        return `<img${newAttrs}>`;
      })
      // Point legacy www.buildfastwithai.com/blogs/... links at this host, then
      // add rel="noopener noreferrer" & target="_blank" to external <a> links.
      .replace(/<a\b([^>]*)>/gi, (match, attrs) => {
        const hrefMatch = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
        if (hrefMatch) {
          const originalHref = hrefMatch[1];
          const href = normalizeLegacyBlogHref(originalHref);
          if (href !== originalHref) {
            attrs = attrs.replace(hrefMatch[0], hrefMatch[0].replace(originalHref, href));
            match = `<a${attrs}>`;
          }
          const isExternal = href.startsWith("http://") || href.startsWith("https://");
          const isInternal = href.includes("buildfastwithai.com") || href.startsWith("/");

          if (isExternal && !isInternal) {
            let newAttrs = attrs;
            if (!/rel\s*=/i.test(newAttrs)) newAttrs += ' rel="noopener noreferrer"';
            if (!/target\s*=/i.test(newAttrs)) newAttrs += ' target="_blank"';
            return `<a${newAttrs}>`;
          }
        }
        return match;
      });

    return { processedContent: optimizedContent, headings: extractedHeadings };
  }, [content, blogTitle]);

  useEffect(() => {
    if (onHeadingsChange) {
      onHeadingsChange(headings);
    }
  }, [headings, onHeadingsChange]);

  useEffect(() => {
    if (!content || !onActiveCtasChange) return;

    // Check explicit CTAs
    const CTA_REGEX = /\{\{cta:([a-zA-Z0-9_-]+)\}\}/gi;
    const explicitMatches = [...content.matchAll(CTA_REGEX)];
    
    if (explicitMatches.length > 0) {
      const active = Array.from(new Set(explicitMatches.map(m => m[1].toLowerCase())));
      onActiveCtasChange(active);
    } else {
      // If there are no explicit CTAs, we don't send the fallback CTAs to the sidebar.
      // The sidebar will just render its own defaults.
      onActiveCtasChange([]);
    }
  }, [content, onActiveCtasChange]);

  if (!processedContent) return <div>No content available</div>;

  const PROSE_CLASS =
    "prose prose-lg dark:prose-invert max-w-none " +
    "prose-headings:font-medium prose-strong:font-semibold " +
    "prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl " +
    "prose-img:rounded-xl prose-img:shadow-lg";

  // Each key maps to one real product surface. Aliases are kept because older
  // posts already have {{cta:...}} tags written against the previous names.
  const getCtaComponent = (ctaName: string) => {
    switch (ctaName.toLowerCase()) {
      case 'claude': return <ClaudeCta />;
      case 'agentic': return <AgenticCta />;
      case 'ai-workshop': return <AiWorkshopCta />;
      case 'corporate': return <CorporateTrainingCta />;
      case 'free-workshop': return <AiWorkshopCta />; // mapped to main workshop CTA
      case 'ai-readiness': return <AiReadinessCta />;
      case 'prompt-library': return <PromptLibraryCta />;
      case 'unrot': return <UnrotCta />;
      case 'ai-tools':
      case 'tools': return <AiToolsCta />;
      case 'vibe-check':
      case 'vibecheck': return <VibeCheckCta />;
      case 'newsletter': return <NewsletterCTA />;
      case 'fde': return <FdeCta />;
      default: return null;
    }
  };

  const renderHtmlWithCta = (html: string) => {
    const containerClass = PROSE_CLASS +
      " prose-a:text-blue-600 dark:prose-a:text-blue-400 " +
      "hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300";

    const CTA_REGEX = /\{\{cta:([a-zA-Z0-9_-]+)\}\}/gi;
    
    // Check if there are any {{cta:}} tags
    const hasCtaTags = html.match(CTA_REGEX);

    if (hasCtaTags) {
      const parts = [];
      let lastIndex = 0;
      let match;

      // Need to reset the regex index before looping
      CTA_REGEX.lastIndex = 0;

      while ((match = CTA_REGEX.exec(html)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            <div 
              key={`html-${lastIndex}`}
              className={containerClass} 
              dangerouslySetInnerHTML={{ __html: html.substring(lastIndex, match.index) }} 
            />
          );
        }

        const ctaType = match[1];
        parts.push(
          <div key={`cta-${match.index}`} className="no-prose">
            {getCtaComponent(ctaType)}
          </div>
        );

        lastIndex = CTA_REGEX.lastIndex;
      }

      if (lastIndex < html.length) {
        parts.push(
          <div 
            key={`html-${lastIndex}`}
            className={containerClass} 
            dangerouslySetInnerHTML={{ __html: html.substring(lastIndex) }} 
          />
        );
      }

      return <>{parts}</>;
    }

    // FALLBACK LOGIC for older blogs
    const h2Regex = /<h2\b[^>]*>/gi;
    const matches = [...html.matchAll(h2Regex)];

    if (matches.length === 0) {
      return (
        <div
          className={containerClass}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // Determine target indices for insertions
    let cta1Idx = -1;
    let cta2Idx = -1;
    let cta3Idx = -1;

    if (matches.length >= 12) {
      cta1Idx = 5; // 6th H2
      cta2Idx = 9; // 10th H2
      cta3Idx = 11; // 12th H2
    } else if (matches.length >= 10) {
      cta1Idx = 5; // 6th H2
      cta2Idx = 9; // 10th H2 (after 9th H2 / before 10th H2)
    } else if (matches.length >= 7) {
      cta1Idx = 4; // 5th H2
      cta2Idx = matches.length - 1; // Last H2
    } else if (matches.length >= 4) {
      cta1Idx = 2; // 3rd H2
      cta2Idx = matches.length - 1; // Last H2
    } else {
      cta1Idx = matches.length - 1; // Last H2
    }

    // Split and assemble html content segments
    if (cta3Idx !== -1) {
      const match1 = matches[cta1Idx];
      const match2 = matches[cta2Idx];
      const match3 = matches[cta3Idx];
      const pos1 = match1.index ?? 0;
      const pos2 = match2.index ?? 0;
      const pos3 = match3.index ?? 0;

      const part1 = html.substring(0, pos1);
      const part2 = html.substring(pos1, pos2);
      const part3 = html.substring(pos2, pos3);
      const part4 = html.substring(pos3);

      return (
        <>
          <div
            className={containerClass}
            dangerouslySetInnerHTML={{ __html: part1 }}
          />
          <div className="no-prose">
            <AgenticCta />
          </div>
          <div
            className={containerClass}
            dangerouslySetInnerHTML={{ __html: part2 }}
          />
          <div className="no-prose">
            <ClaudeCta />
          </div>
          <div
            className={containerClass}
            dangerouslySetInnerHTML={{ __html: part3 }}
          />
          <div className="no-prose">
            <UnrotCta />
          </div>
          <div
            className={containerClass}
            dangerouslySetInnerHTML={{ __html: part4 }}
          />
        </>
      );
    } else if (cta2Idx !== -1) {
      const match1 = matches[cta1Idx];
      const match2 = matches[cta2Idx];
      const pos1 = match1.index ?? 0;
      const pos2 = match2.index ?? 0;

      const part1 = html.substring(0, pos1);
      const part2 = html.substring(pos1, pos2);
      const part3 = html.substring(pos2);

      return (
        <>
          <div
            className={containerClass}
            dangerouslySetInnerHTML={{ __html: part1 }}
          />
          <div className="no-prose">
            <AgenticCta />
          </div>
          <div
            className={containerClass}
            dangerouslySetInnerHTML={{ __html: part2 }}
          />
          <div className="no-prose">
            <ClaudeCta />
          </div>
          <div
            className={containerClass}
            dangerouslySetInnerHTML={{ __html: part3 }}
          />
        </>
      );
    } else {
      const match1 = matches[cta1Idx];
      const pos1 = match1.index ?? 0;

      const part1 = html.substring(0, pos1);
      const part2 = html.substring(pos1);

      return (
        <>
          <div
            className={containerClass}
            dangerouslySetInnerHTML={{ __html: part1 }}
          />
          <div className="no-prose">
            <AgenticCta />
          </div>
          <div
            className={containerClass}
            dangerouslySetInnerHTML={{ __html: part2 }}
          />
        </>
      );
    }
  };

  // Render logic — handles Quiz and Assessment special sections
  const renderContent = () => {
    // ── Quiz section ─────────────────────────────────────────────────────────
    if (processedContent.includes('<div id="quiz"')) {
      const quizStartIndex = processedContent.indexOf('<div id="quiz"');
      const quizEndIndex = processedContent.lastIndexOf("</div>") + 6;
      const beforeQuiz = processedContent.substring(0, quizStartIndex);
      const quizContent = processedContent.substring(quizStartIndex, quizEndIndex);
      const afterQuiz = processedContent.substring(quizEndIndex);

      return (
        <>
          {beforeQuiz.trim() && renderHtmlWithCta(beforeQuiz)}
          <QuizContainer content={quizContent} />
          {afterQuiz.trim() && (
            <div
              className={PROSE_CLASS}
              dangerouslySetInnerHTML={{ __html: afterQuiz }}
            />
          )}
        </>
      );
    }

    // ── Assessment section ───────────────────────────────────────────────────
    if (processedContent.includes('<div id="assessment"')) {
      const assessmentStartIndex = processedContent.indexOf('<div id="assessment"');
      const assessmentEndIndex = processedContent.lastIndexOf("</div>") + 6;
      const beforeAssessment = processedContent.substring(0, assessmentStartIndex);
      const assessmentContent = processedContent.substring(
        assessmentStartIndex,
        assessmentEndIndex
      );
      const afterAssessment = processedContent.substring(assessmentEndIndex);

      return (
        <>
          {beforeAssessment.trim() && renderHtmlWithCta(beforeAssessment)}
          <AssessmentContainer content={assessmentContent} />
          {afterAssessment.trim() && (
            <div
              className={PROSE_CLASS}
              dangerouslySetInnerHTML={{ __html: afterAssessment }}
            />
          )}
        </>
      );
    }

    // ── Default render ───────────────────────────────────────────────────────
    return renderHtmlWithCta(processedContent);
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor) {
      posthog.capture("blog_in_article_link_clicked", {
        link_href: anchor.href,
        link_text: anchor.innerText || anchor.textContent,
      });
    }
  };

  return <div className="blog-content w-full" onClick={handleContentClick}>{renderContent()}</div>;
}
