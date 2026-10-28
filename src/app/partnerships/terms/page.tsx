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
  "Terms for sponsored articles, guest posts, in-blog CTAs and SEO services on Build Fast with AI: what each service includes, pricing, payment, refunds and content rights.";

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
  ["t-services", "Services & pricing"],
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

const CTA_GRID: [string, string, string, string, string][] = [
  ["1 blog", "$75", "$205", "$360", "$630"],
  ["5 blogs", "$315", "$845", "$1,500", "$2,625"],
  ["10 blogs", "$550", "$1,485", "$2,640", "$4,620"],
  ["25 blogs", "$1,250", "$3,375", "$6,000", "$10,500"],
  ["50 blogs", "$2,250", "$6,075", "$10,800", "$18,900"],
];

const CONTENT_GRID: [string, string, string, string, string][] = [
  ["2 articles", "$700", "$1,330", "$1,890", "$3,360"],
  ["4 articles", "$1,300", "$2,470", "$3,510", "$6,240"],
  ["8 articles", "$2,400", "$4,560", "$6,480", "$11,520"],
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
              <div className="blk rv" id="t-services">
                <h3><span className="bn">01</span>Services &amp; pricing</h3>
                <p>The service cards on the partnerships page show launch prices only. This section is the full description of what each service includes and what it costs. All prices are in USD and exclude taxes. The written quote we send you is the price that applies.</p>

                <div className="sub" id="t-s1">
                  <h4>Sponsored article &amp; guest post</h4>
                  <ul>
                    <li><b>Price:</b> $300 if you write the article and we edit and publish it, or $600 if we write it. An extra link costs $75. A 30-day homepage feature costs $100.</li>
                    <li><b>What you get:</b> a 2,500 to 4,000 word article, up to 2 contextual links, SEO and AI-search formatting, one review round, and a clear &quot;Sponsored&quot; label.</li>
                    <li><b>Timing:</b> about 5 working days if you write it, or 7 to 10 working days if we write it, counted from the day the topic and payment are confirmed.</li>
                    <li><b>Your draft:</b> it must follow the <Link className="zz-terms" href="/partnerships/guidelines">article guidelines</Link>. We may edit it or ask for changes, and we may decline it.</li>
                    <li><b>Volume:</b> discounts for several articles are given only when they are written in your quote.</li>
                  </ul>
                </div>

                <div className="sub" id="t-s2">
                  <h4>Contextual mention</h4>
                  <ul>
                    <li><b>Price:</b> $150 for a link in a standard post, or $250 in a top-traffic post. Three links cost $400 and five links cost $600.</li>
                    <li><b>What you get:</b> one link or short mention inside an article that is already published and indexed, with a branded or natural anchor. We suggest 3 posts and you pick one.</li>
                    <li><b>Timing:</b> about 48 hours after you pick the post and payment is confirmed.</li>
                    <li><b>Exact-match anchors:</b> an exact-match commercial anchor costs $75 extra and is subject to our approval. We may ask you to use a branded anchor instead.</li>
                    <li><b>Placement:</b> we write the sentence so it fits the article. The link stays live for at least 12 months. If we merge, move or remove the article, we place the link in an equivalent article or redirect it.</li>
                  </ul>
                </div>

                <div className="sub" id="t-s3">
                  <h4>In-blog CTA</h4>
                  <ul>
                    <li><b>Price:</b> $75 per blog per month for a standard post, and $150 per blog per month for a top-traffic post. We tell you which posts are top-traffic in your quote. Priced per blog and per month, so the total depends only on how many blogs and how long.</li>
                    <li><b>What you get:</b> one CTA card, labelled as a partner placement, inside each blog you choose from our list. You send the title, one line of copy, button text and link. We choose the position in the post.</li>
                    <li><b>Run time:</b> the card runs for the period you pay for and is removed when it ends. The 12-month minimum live rule does not apply to CTAs.</li>
                    <li><b>Swaps:</b> you can swap one blog per month for another of the same tier at no cost.</li>
                    <li><b>Not exclusive:</b> we also show our own CTAs and other partners&apos; CTAs. We will not put two sponsored cards in the same post unless you agree. We do not guarantee views, clicks or sign-ups.</li>
                    <li><b>Payment:</b> in full, upfront, for the whole period. Longer periods get a discount: 10% for 3 months, 20% for 6 months and 30% for 12 months.</li>
                  </ul>
                  <p className="grid-cap">Standard posts, total price for one CTA card. Top-traffic posts cost twice the amount shown.</p>
                  <div className="tbl-scroll">
                    <table className="grid">
                      <tbody>
                        <tr><th>Number of blogs</th><th>1 month</th><th>3 months</th><th>6 months</th><th>12 months</th></tr>
                        {CTA_GRID.map((r) => (
                          <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="grid-cap">A different number of blogs is priced at the nearest tier&apos;s rate per blog.</p>
                </div>

                <div className="sub" id="t-s4">
                  <h4>Tool review</h4>
                  <ul>
                    <li><b>Price:</b> $700 for a full review. Adding the tool to a ranking or roundup post costs $200 more. Ranking inclusion without a review costs $250.</li>
                    <li><b>What you get:</b> we test the product, add screenshots, cover pros, cons and pricing, and give our own verdict. Up to 2 links. Timing is about 10 working days once we have access to the product.</li>
                    <li><b>Independent verdict:</b> you pay for the coverage, not for a result. We do not sell scores or positions, we may publish negative findings, and you cannot change the verdict. You may correct factual errors.</li>
                    <li><b>Rankings:</b> being included in a ranking does not guarantee a position. The order is our own assessment.</li>
                    <li><b>Access:</b> you give us a working account or trial. If we decide not to publish, you get a full refund.</li>
                  </ul>
                </div>

                <div className="sub" id="t-s5">
                  <h4>X promotion</h4>
                  <ul>
                    <li><b>Price:</b> $100 for a single post and $200 for a short thread. When bought with another service the price is $75 and $150.</li>
                    <li><b>What you get:</b> one post or short thread on the Build Fast with AI X account, written in our voice, linking to your page. We agree the date with you.</li>
                    <li><b>No guarantees:</b> we do not promise impressions, clicks or engagement.</li>
                  </ul>
                </div>

                <div className="sub" id="t-s6">
                  <h4>Content packages (content only)</h4>
                  <ul>
                    <li><b>Price:</b> $700 a month for 2 articles, $1,300 for 4 articles and $2,400 for 8 articles. Longer periods cost less per month, as shown below.</li>
                    <li><b>What you get:</b> keyword-researched, SEO-focused articles of 2,000 to 3,000 words, each delivered as a .docx or Google Doc with title, meta description, headings, FAQ and internal link suggestions. We share the content calendar for the whole period in week 1. One round of edits per article is included.</li>
                    <li><b>Content only:</b> nothing is published on our blog and there is no CTA or X post. You publish the articles on your own site.</li>
                    <li><b>Payment:</b> in full, upfront, for the period you choose.</li>
                  </ul>
                  <p className="grid-cap">Total price for the period. The discount against paying month by month is 5% for 2 months, 10% for 3 months and 20% for 6 months.</p>
                  <div className="tbl-scroll">
                    <table className="grid">
                      <tbody>
                        <tr><th>Articles per month</th><th>1 month</th><th>2 months</th><th>3 months</th><th>6 months</th></tr>
                        {CONTENT_GRID.map((r) => (
                          <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="sub" id="t-s7">
                  <h4>SEO &amp; content for your own website</h4>
                  <ul>
                    <li><b>Price:</b> $800 one-time audit (waived if you sign Growth or Scale), then $1,500 a month for Starter, $3,000 a month for Growth, or $5,500 a month for Scale.</li>
                    <li><b>Starter:</b> 4 posts a month and monthly Search Console reporting.</li>
                    <li><b>Growth:</b> 8 posts a month, refreshes of older posts, internal linking and schema.</li>
                    <li><b>Scale:</b> 16 posts a month and full technical SEO.</li>
                    <li><b>Audit:</b> technical, on-page and content SEO review with keyword research and topic clusters.</li>
                    <li><b>Term:</b> 3 months minimum, billed monthly in advance. After the minimum you can cancel with 30 days&apos; notice.</li>
                    <li><b>Access:</b> you give us the access we need (your CMS, Search Console and analytics). Work outside the plan is quoted separately.</li>
                  </ul>
                </div>
              </div>

              <div className="blk rv" id="t-duration">
                <h3><span className="bn">02</span>Placement duration</h3>
                <ul>
                  <li>Sponsored articles, guest posts and contextual mentions stay live for a <b>minimum of 12 months</b> from the publish date.</li>
                  <li>In-blog CTAs run for the period you paid for. X posts are published once.</li>
                  <li>After 12 months, content usually stays online, but we may update, merge, redirect or remove it as part of regular site maintenance.</li>
                  <li>If a URL changes during the placement period, we redirect it to the new location.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-payment">
                <h3><span className="bn">03</span>Payment</h3>
                <ul>
                  <li>Prices are in <b>USD</b> and exclude applicable taxes, including GST where it applies. Payment details are shared with the invoice.</li>
                  <li>Quotes are valid for <b>14 days</b> from the date sent.</li>
                  <li>The prices on the partnerships page are launch prices and may change. The written quote you accept is the price that applies, and a discount applies only if it is written in that quote.</li>
                  <li>Articles, mentions, reviews and X posts are paid in full <b>before they go live</b>. CTAs and content packages are paid upfront for the whole period. SEO plans are billed monthly in advance.</li>
                  <li>We may pause work until an overdue invoice is paid.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-editorial">
                <h3><span className="bn">04</span>Editorial control</h3>
                <ul>
                  <li>We have final say on title, structure, edits, images, publish date and link placement.</li>
                  <li>One review round is included. Extra revisions are quoted separately.</li>
                  <li>Reviews and rankings are our own independent assessment. Payment does not buy a positive verdict, score or position.</li>
                  <li>We may update published articles to keep facts, pricing and model names accurate.</li>
                  <li>Paid content is labelled as sponsored, and paid links carry <code>rel=&quot;sponsored&quot;</code>.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-links">
                <h3><span className="bn">05</span>Links &amp; changes after publishing</h3>
                <ul>
                  <li>Paid links are marked <code>rel=&quot;sponsored&quot;</code>, as Google&apos;s paid-link guidelines require. <b>We do not sell dofollow links</b> and make no promise about link value or rankings.</li>
                  <li>Extra links and exact-match anchors are priced in the service descriptions above and need our approval.</li>
                  <li>Link or anchor changes after publishing are allowed <b>once within 30 days</b> free of charge. Later changes are quoted separately.</li>
                  <li>If your target page breaks, redirects elsewhere or changes topic, we may remove or replace the link.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-removal">
                <h3><span className="bn">06</span>Removal</h3>
                <ul>
                  <li>We may remove a link, CTA or article without refund if the target site later hosts restricted content, malware, scams or illegal material.</li>
                  <li>We may also remove content where required by law or by a search engine policy.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-results">
                <h3><span className="bn">07</span>No guarantees on rankings or traffic</h3>
                <ul>
                  <li>We publish on an indexed domain and request indexing, but we cannot guarantee Google indexing, rankings, traffic, clicks, sign-ups or conversions.</li>
                  <li>Traffic figures on the partnerships page come from Google Search Console, reflect past performance and are not a promise of future results.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-refunds">
                <h3><span className="bn">08</span>Refunds &amp; cancellation</h3>
                <ul>
                  <li>Full refund if we cancel or decline the placement after payment.</li>
                  <li><b>Articles, mentions, reviews and X posts:</b> if you cancel after writing has started, 50% is refundable. After publishing, payments are non-refundable.</li>
                  <li><b>CTAs and content packages paid for several months:</b> cancel before the first month starts for a full refund. After that, you pay the single-month price for each month already started, and we refund the rest.</li>
                  <li>If we fail to show a CTA or deliver an article you paid for, we refund or redo the part we did not deliver.</li>
                  <li><b>SEO plans:</b> after the 3-month minimum, cancel with 30 days&apos; notice. Work already done in the notice period is charged.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-rights">
                <h3><span className="bn">09</span>Content rights</h3>
                <ul>
                  <li><b>Published on our blog:</b> articles are exclusive to Build Fast with AI and may not be republished elsewhere. You may quote and link to them.</li>
                  <li><b>Content packages and SEO work for your site:</b> the content is yours once it is paid for, and you may publish it on your own site. We may mention that we worked with you only if you agree.</li>
                  <li>Where you supply text, images or logos, you confirm the work is original and that you hold the rights to everything you supply.</li>
                  <li>Guest authors keep their byline credit.</li>
                </ul>
              </div>
              <div className="blk rv" id="t-general">
                <h3><span className="bn">10</span>General</h3>
                <ul>
                  <li>These terms apply to every paid placement, guest post and content service. Sending a request or payment means you accept them.</li>
                  <li>We may decline any request without giving a reason. We do not trade links or insert links for free.</li>
                  <li>Placements are not exclusive. We do not promise to keep competitors out of the blog, a post or a placement unless we agree it in writing.</li>
                  <li>Custom quotes and negotiated discounts are kept confidential by both sides.</li>
                  <li>Our total liability for any order is limited to the amount you paid for it. We are not liable for indirect losses, including lost traffic, sales or rankings.</li>
                  <li>The details you send through the request form are used only to reply to you and manage your order.</li>
                  <li>These terms are governed by the laws of India.</li>
                  <li>We may update these terms. The version live on the date of payment applies to that order.</li>
                </ul>
                <p className="terms-note">Questions about these terms: <a href="mailto:sanjeev@buildfastwithai.com">sanjeev@buildfastwithai.com</a>. Last updated 28 October 2026.</p>
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
