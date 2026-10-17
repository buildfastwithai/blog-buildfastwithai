import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogUrl, MAIN_SITE_URL } from "@/lib/urls";
import { combineSchemas, generateBreadcrumbSchema } from "@/utils/seo/json-ld";
import { Reveal } from "../_components/reveal";
import { Closing } from "../_components/site-header";
import { Split } from "../_components/split";
import { partnershipMetadata, webPageSchema } from "../_lib/seo";

const TITLE = "Sponsored Post Terms: Payment, Refunds & Rights";
const DESCRIPTION =
  "Terms for sponsored articles, guest posts and SEO services on Build Fast with AI: 12-month placement, payment, editorial control, refunds and content rights.";

export const metadata: Metadata = partnershipMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/partnerships/terms",
  socialTitle: "Terms for Sponsored Posts & Partnerships | Build Fast with AI",
  keywords: [
    "sponsored post terms",
    "guest post terms and conditions",
    "sponsored article refund policy",
    "placement duration",
    "content rights",
  ],
});

const TOC = [
  ["t-duration", "Placement duration"],
  ["t-payment", "Payment"],
  ["t-editorial", "Editorial control"],
  ["t-links", "Links & changes"],
  ["t-removal", "Removal"],
  ["t-results", "No guarantees"],
  ["t-refunds", "Refunds"],
  ["t-rights", "Content rights"],
  ["t-general", "General"],
];

export default function TermsPage() {
  const schema = combineSchemas(
    webPageSchema({ name: TITLE, description: DESCRIPTION, path: "/partnerships/terms" }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: MAIN_SITE_URL },
        { name: "Blog", url: blogUrl("/") },
        { name: "Partnerships", url: blogUrl("/partnerships") },
        { name: "Terms", url: blogUrl("/partnerships/terms") },
      ],
    }),
  );

  return (
    <>
      <JsonLd data={schema} />
      <Reveal />
      <div className="subbar">
        <div className="wrap">
          <Link className="back link" href="/partnerships">&larr; Back to partnerships</Link>
          <span className="crumb">Partnerships / Terms</span>
        </div>
      </div>

      <section id="terms">
        <div className="wrap">
          <div className="head">
            <div className="num rv">Terms</div>
            <div>
              <Split as="h1">Terms for sponsored <em>posts &amp; partnerships.</em></Split>
            </div>
          </div>
          <div className="doc">
            <nav className="toc" aria-label="Terms contents">
              <b>Contents</b>
              {TOC.map(([id, label]) => (
                <a key={id} href={`#${id}`}>{label}</a>
              ))}
            </nav>
            <div>
              <div className="blk rv" id="t-duration">
                <h3><span className="bn">01</span>Placement duration</h3>
                <ul>
                  <li>Sponsored articles, guest posts and contextual mentions stay live for a <b>minimum of 12 months</b> from the publish date.</li>
                  <li>After 12 months, content usually stays online, but we may update, merge, redirect or remove it as part of regular site maintenance.</li>
                  <li>If a URL changes during the placement period, we redirect it to the new location.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-payment">
                <h3><span className="bn">02</span>Payment</h3>
                <ul>
                  <li>Quotes are valid for <b>14 days</b> from the date sent.</li>
                  <li>Full payment is due <b>before the article goes live</b>. Monthly packages and SEO services are billed in advance each month.</li>
                  <li>Prices exclude applicable taxes. Payment details are shared with the invoice.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-editorial">
                <h3><span className="bn">03</span>Editorial control</h3>
                <ul>
                  <li>We have final say on title, structure, edits, images, publish date and link placement.</li>
                  <li>One review round is included. Extra revisions are quoted separately.</li>
                  <li>We may update published articles to keep facts, pricing and model names accurate.</li>
                  <li>Paid content is labelled as sponsored, and paid links carry <code>rel=&quot;sponsored&quot;</code>.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-links">
                <h3><span className="bn">04</span>Links &amp; changes after publishing</h3>
                <ul>
                  <li>Link or anchor changes after publishing are allowed <b>once within 30 days</b> free of charge. Later changes are quoted separately.</li>
                  <li>If your target page breaks, redirects elsewhere or changes topic, we may remove or replace the link.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-removal">
                <h3><span className="bn">05</span>Removal</h3>
                <ul>
                  <li>We may remove a link or article without refund if the target site later hosts restricted content, malware, scams or illegal material.</li>
                  <li>We may also remove content where required by law or by a search engine policy.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-results">
                <h3><span className="bn">06</span>No guarantees on rankings or traffic</h3>
                <ul>
                  <li>We publish on an indexed domain and request indexing, but we cannot guarantee Google indexing, rankings, traffic, clicks or conversions.</li>
                  <li>Traffic figures on this page reflect past performance and are not a promise of future results.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-refunds">
                <h3><span className="bn">07</span>Refunds &amp; cancellation</h3>
                <ul>
                  <li>Full refund if we cancel or decline the placement after payment.</li>
                  <li>If you cancel after writing has started, 50% is refundable. After publishing, payments are non-refundable.</li>
                  <li>Monthly packages can be cancelled with 30 days&apos; notice.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-rights">
                <h3><span className="bn">08</span>Content rights</h3>
                <ul>
                  <li>Published articles are exclusive to Build Fast with AI and may not be republished elsewhere. You may quote and link to them.</li>
                  <li>Guest contributors confirm the work is original and that they hold rights to all text and images supplied.</li>
                  <li>Guest authors keep their byline credit.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-general">
                <h3><span className="bn">09</span>General</h3>
                <ul>
                  <li>These terms apply to every paid placement, guest post and content service. Sending a request or payment means you accept them.</li>
                  <li>We may decline any request without giving a reason.</li>
                  <li>Project details and pricing are kept confidential by both sides.</li>
                  <li>We may update these terms. The version live on the date of payment applies to that order.</li>
                </ul>
                <p className="terms-note">Questions about these terms: <a href="mailto:sanjeev@buildfastwithai.com">sanjeev@buildfastwithai.com</a>. Last updated 16 October 2026.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Closing kicker="Next step">
        <Split>Questions answered? <em>Let&apos;s talk.</em></Split>
      </Closing>
    </>
  );
}
