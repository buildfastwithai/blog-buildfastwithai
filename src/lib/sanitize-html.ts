import "server-only";

import sanitize, { type IOptions } from "sanitize-html";

/**
 * Allowlist sanitizer for article and collection HTML stored in Supabase.
 *
 * That HTML is rendered with dangerouslySetInnerHTML, so anyone who can write
 * to `blogs.content` or `blogs_curated.extended_content` (a compromised editor
 * account, or an RLS mistake) could otherwise run script on every reader's
 * page. This runs on the server when the row is fetched, before the HTML is
 * cached by ISR or handed to a client component.
 *
 * The allowlist was set from what published articles actually use: text and
 * headings, links, lists, code blocks, images (including data:image PNGs from
 * notebook output), tables, plus the `id` hooks the quiz/assessment widgets
 * and the table of contents rely on. `{{cta:name}}` markers are plain text and
 * pass through untouched.
 *
 * Removed: <script>, <style>, <object>, <embed>, <form> and other unlisted
 * tags; every on* handler; javascript:, vbscript: and data: links; iframes
 * from anywhere but the video hosts below.
 */
const COLOR = [
  /^#[0-9a-f]{3,8}$/i,
  /^rgba?\(\s*[\d.\s,%]+\)$/i,
  /^[a-z]{3,20}$/i,
];

const OPTIONS: IOptions = {
  allowedTags: [
    ...sanitize.defaults.allowedTags,
    "h1",
    "h2",
    "img",
    "del",
    "ins",
    "details",
    "summary",
    "iframe",
  ],
  allowedAttributes: {
    "*": ["class", "id", "title", "lang", "dir", "style", "aria-*", "data-*"],
    a: ["href", "target", "rel"],
    img: [
      "src",
      "srcset",
      "sizes",
      "alt",
      "width",
      "height",
      "loading",
      "decoding",
    ],
    iframe: [
      "src",
      "width",
      "height",
      "allow",
      "allowfullscreen",
      "frameborder",
      "loading",
      "referrerpolicy",
    ],
    ol: ["start", "type", "reversed"],
    td: ["colspan", "rowspan", "align"],
    th: ["colspan", "rowspan", "align", "scope"],
    pre: ["spellcheck"],
  },
  allowedStyles: {
    "*": {
      color: COLOR,
      "background-color": COLOR,
      "text-align": [/^(left|right|center|justify|start|end)$/],
      width: [/^\d+(\.\d+)?(px|%|em|rem)?$/],
      "font-weight": [/^(normal|bold|[1-9]00)$/],
      "font-style": [/^(normal|italic)$/],
      "text-decoration": [/^(none|underline|line-through)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Inline images only: an <img> cannot run script from a data: URL.
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  allowProtocolRelative: false,
  allowedIframeHostnames: [
    "www.youtube.com",
    "youtube.com",
    "www.youtube-nocookie.com",
    "player.vimeo.com",
    "www.loom.com",
  ],
  allowIframeRelativeUrls: false,
};

export function sanitizeContentHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitize(html, OPTIONS);
}
