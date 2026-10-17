import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogUrl, MAIN_SITE_URL } from "@/lib/urls";
import {
  combineSchemas,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/utils/seo/json-ld";
import { InquiryForm } from "./_components/inquiry-form";
import { LivePreview } from "./_components/live-preview";
import { Reveal } from "./_components/reveal";
import { ServicesCarousel } from "./_components/services-carousel";
import { Split } from "./_components/split";
import { partnershipMetadata, partnershipServiceSchema, webPageSchema } from "./_lib/seo";

const TITLE = "Write for Us: AI Guest Posts & Sponsored Articles";
const DESCRIPTION =
  "Publish guest posts, sponsored articles, tool reviews and in-blog CTAs on the Build Fast with AI blog. 2.67M search clicks in 6 months, DR 63.";

export const metadata: Metadata = partnershipMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/partnerships",
  socialTitle: "Write for Us: Guest Posts & Sponsored Articles | Build Fast with AI",
  keywords: [
    "write for us AI",
    "AI guest post",
    "guest posting",
    "sponsored article",
    "sponsored post",
    "tool review",
    "AI blog advertising",
    "in-blog CTA",
    "SEO content services",
  ],
});

const FAQS = [
  { question: "Do you accept guest posts?", answer: "Yes. Send 2 to 3 topic ideas through the form. After approval, submit the article as a Google Doc following the guidelines." },
  { question: "Are links dofollow?", answer: "Up to 2 contextual dofollow links per article. Paid placements are marked rel=\"sponsored\" to follow Google's paid-link guidelines." },
  { question: "How long does an article stay live?", answer: "A minimum of 12 months from the publish date. Most articles stay online well beyond that." },
  { question: "Are articles indexed by Google?", answer: "All articles are open to search engines, listed in our sitemap and submitted for indexing. Indexing itself is decided by Google." },
  { question: "How long does publishing take?", answer: "Usually 5 to 10 working days after topic approval. Contextual mentions are often faster." },
  { question: "Can you write the article for us?", answer: "Yes. Our Sponsored Article service covers research, writing, SEO and publishing. You review the draft first." },
  { question: "How much does it cost?", answer: "It depends on the service, length and number of placements. Send a request and we reply with a tailored quote." },
  { question: "Can you manage SEO for our own website?", answer: "Yes: audits, keyword research, writing, content refreshes and monthly reporting. Send a request to scope it." },
];

const MARQUEE = ["Sponsored Articles", "Guest Posts", "Contextual Mentions", "Tool Reviews", "In-Blog CTAs", "X Promotion", "SEO & Content"];

export default function PartnershipsPage() {
  const schema = combineSchemas(
    webPageSchema({ name: TITLE, description: DESCRIPTION, path: "/partnerships" }),
    partnershipServiceSchema(),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: MAIN_SITE_URL },
        { name: "Blog", url: blogUrl("/") },
        { name: "Partnerships", url: blogUrl("/partnerships") },
      ],
    }),
    generateFAQSchema({ faqs: FAQS }),
  );

  return (
    <>
      <JsonLd data={schema} />
      <Reveal />

      {/* HERO */}
      <div className="hero-screen">
        <section className="hero">
          <div className="wrap">
            <span className="kicker in">
              <span className="k-full">Partnership Services &middot; Write for us</span>
              <span className="k-short">Write for us &middot; Guest posts &middot; SEO</span>
            </span>
            <Split as="h1">
              Put your product in front of builders who <em className="hl">actually ship.</em>
            </Split>
            <div className="hero-bottom">
              <p className="lead">
                <span className="lead-full">
                  Sponsored articles, guest posts, contextual mentions, tool reviews and SEO content on the Build Fast with AI blog. Edited to our standard, so it reads like journalism, not an ad.
                </span>
                <span className="lead-short">
                  Guest posts, sponsored articles, reviews and SEO on the Build Fast with AI blog.
                </span>
              </p>
              <div className="hero-ctas">
                <a className="btn btn-solid" href="#contact">
                  Send your request <span className="arr">&rarr;</span>
                </a>
                <Link className="btn btn-line" href="/partnerships/guidelines">
                  <span className="lbl-full">Read the guidelines</span>
                  <span className="lbl-short">Guidelines</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="track">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* NUMBERS */}
      <section id="numbers">
        <div className="wrap">
          <div className="head">
            <div className="num rv">Reach</div>
            <div>
              <Split>Real search traffic, <em>not vanity numbers.</em></Split>
            </div>
          </div>
          <div className="stats rv">
            <div className="stat"><b><span data-count="2.67" data-dec="2">2.67</span><sup>M</sup></b><span>Search clicks</span><small>Last 6 months</small></div>
            <div className="stat"><b><span data-count="47.2" data-dec="1">47.2</span><sup>M</sup></b><span>Impressions</span><small>Last 6 months</small></div>
            <div className="stat"><b><span data-count="63" data-dec="0">63</span></b><span>Domain Rating</span><small>Authority</small></div>
            <div className="stat"><b><span data-count="6.4" data-dec="1">6.4</span></b><span>Avg. position</span><small>Last 6 months</small></div>
          </div>
          <div className="stats-2 rv d1">
            <div className="mini"><span>Clicks, 28 days</span><b><span data-count="131" data-dec="0">131</span>K</b></div>
            <div className="mini"><span>Impressions, 28 days</span><b><span data-count="1.7" data-dec="1">1.7</span>M</b></div>
            <div className="mini"><span>CTR, 28 days</span><b><span data-count="7.7" data-dec="1">7.7</span>%</b></div>
          </div>
          <p className="source rv d2">Source: Google Search Console, web search, data to 15 Oct 2026. Full breakdown on request.</p>
          <div className="aud rv d3">
            <span>Developers</span><span>AI engineers</span><span>Founders</span><span>Product teams</span><span>Marketers using AI</span>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section id="content" className="rule">
        <div className="wrap">
          <div className="head">
            <div className="num rv">Content</div>
            <div>
              <Split>Where your brand <em>shows up.</em></Split>
            </div>
          </div>
          <div className="rv">
            <LivePreview />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="rule">
        <div className="wrap">
          <div className="head">
            <div className="num rv">Services</div>
            <div>
              <Split>Guest posts, reviews, <em>CTAs &amp; more.</em></Split>
            </div>
          </div>

          <ServicesCarousel>
            <article className="zz" id="svc-1">
              <div className="zz-vis" aria-hidden="true">
                <span className="ghost">01</span>
                <div className="mock m-article">
                  <div className="m-bar"><i></i><i></i><i></i><span>blog.buildfastwithai.com</span></div>
                  <span className="m-tag">Sponsored</span>
                  <div className="m-h">How teams cut LLM costs by switching models</div>
                  <div className="m-byline sm"><Image className="m-photo" src="/authors/satvik.png" alt="Satvik Paramkusam, founder of Build Fast with AI" width={34} height={34} /><div><b>Satvik Paramkusam</b><small>Build Fast with AI &middot; 8 min read</small></div></div>
                  <div className="m-line w90"></div><div className="m-line w75"></div>
                  <div className="m-img"></div>
                </div>
              </div>
              <div className="zz-txt">
                <div className="zz-meta"><span className="zz-n">01</span><span className="zz-tag">We write it, or you do</span></div>
                <h3>Sponsored Article <em>&amp; Guest Post</em></h3>
                <p>A full article built around your product or a topic your buyers search for. Our team writes it, or you submit your own and we edit it.</p>
                <ul className="zz-points"><li>2,500 to 4,000 words</li><li>Up to 2 contextual links</li><li>SEO and AI-search ready</li><li>Your review before publishing</li></ul>
                <a className="btn btn-solid" href="#contact" data-pick="Sponsored article / guest post">Request an article <span className="arr">&rarr;</span></a>
              </div>
            </article>

            <article className="zz" id="svc-2">
              <div className="zz-vis dark" aria-hidden="true">
                <span className="ghost">02</span>
                <div className="mock m-mention">
                  <p>Most teams route simple tasks to a cheaper model. Tools like <mark>Nimbus AI</mark> make that switch easy.</p>
                  <div className="m-stat"><span>Indexed</span><span>Ranking</span></div>
                </div>
              </div>
              <div className="zz-txt">
                <div className="zz-meta"><span className="zz-n">02</span><span className="zz-tag">Link in an existing post</span></div>
                <h3>Contextual <em>Mention</em></h3>
                <p>Your link or a short mention inside a relevant article that is already indexed and earning search traffic.</p>
                <ul className="zz-points"><li>Placed only where it fits</li><li>1 link, natural anchor text</li><li>We suggest the best posts</li><li>Fastest turnaround</li></ul>
                <a className="btn btn-line" href="#contact" data-pick="Contextual mention">Request a mention <span className="arr">&rarr;</span></a>
              </div>
            </article>

            <article className="zz" id="svc-3">
              <div className="zz-vis tone" aria-hidden="true">
                <span className="ghost">03</span>
                <div className="mock m-cta">
                  <div className="m-h">Top AI news this week</div>
                  <div className="m-line w95"></div><div className="m-line w80"></div>
                  <div className="m-ad">
                    <span className="m-ad-l">Partner</span>
                    <div><b>Try Nimbus AI free</b><small>Build and ship AI apps fast</small></div>
                    <span className="m-ad-btn">Start &rarr;</span>
                  </div>
                  <div className="m-pos"><span>Top</span><span className="on">Mid-article</span><span>End</span></div>
                </div>
              </div>
              <div className="zz-txt">
                <div className="zz-meta"><span className="zz-n">03</span><span className="zz-tag">Native ad in our posts</span></div>
                <h3>In-Blog <em>CTA</em></h3>
                <p>Put your call-to-action card or banner inside our articles, including top-traffic and trending posts.</p>
                <ul className="zz-points"><li>Top, mid or end placement</li><li>Topic-matched posts</li><li>Your copy, link and button</li><li>Matches our blog style</li></ul>
                <a className="btn btn-solid" href="#contact" data-pick="In-blog CTA placement">Place your CTA <span className="arr">&rarr;</span></a>
              </div>
            </article>

            <article className="zz" id="svc-4">
              <div className="zz-vis" aria-hidden="true">
                <span className="ghost">04</span>
                <div className="mock m-review">
                  <div className="m-rhead"><span className="m-logo">N</span><div><b>Nimbus AI</b><small>Hands-on review</small></div><span className="m-score">8.6<em>/10</em></span></div>
                  <div className="m-bars">
                    <div><span>Ease of use</span><i style={{ ["--v" as string]: "88%" }}></i></div>
                    <div><span>Output quality</span><i style={{ ["--v" as string]: "82%" }}></i></div>
                    <div><span>Value</span><i style={{ ["--v" as string]: "74%" }}></i></div>
                  </div>
                  <div className="m-pc"><div><b>Pros</b><span>Fast setup</span><span>Clean API</span></div><div><b>Cons</b><span>Small free tier</span></div></div>
                </div>
              </div>
              <div className="zz-txt">
                <div className="zz-meta"><span className="zz-n">04</span><span className="zz-tag">Hands-on coverage</span></div>
                <h3>Tool <em>Review</em></h3>
                <p>We test your product and publish a review, or include it in a ranking or best-tools roundup.</p>
                <ul className="zz-points"><li>Real testing, screenshots</li><li>Pros, cons and pricing</li><li>Review or roundup slot</li><li>Independent verdict</li></ul>
                <a className="btn btn-line" href="#contact" data-pick="Tool review / feature">Request a review <span className="arr">&rarr;</span></a>
              </div>
            </article>

            <article className="zz" id="svc-5">
              <div className="zz-vis dark" aria-hidden="true">
                <span className="ghost">05</span>
                <div className="mock m-x">
                  <div className="m-ph"><Image className="m-photo" src="/favicon_package/android-chrome-192x192.png" alt="Build Fast with AI logo" width={28} height={28} /><div><b>Build Fast with AI</b><small>@buildfastwithai</small></div><span className="m-xlogo">&#120143;</span></div>
                  <p>Just tested Nimbus AI for agent workflows. Setup took 4 minutes. &#8595;</p>
                  <div className="m-xcard"><span>blog.buildfastwithai.com</span><b>Nimbus AI review: worth it?</b></div>
                </div>
              </div>
              <div className="zz-txt">
                <div className="zz-meta"><span className="zz-n">05</span><span className="zz-tag">Add-on</span></div>
                <h3>X <em>Promotion</em></h3>
                <p>We post about your product or article to our X audience and link straight to your page.</p>
                <ul className="zz-points"><li>Single post or short thread</li><li>Your link and CTA</li><li>Written in our voice</li><li>Pairs with any placement</li></ul>
                <a className="btn btn-solid" href="#contact" data-pick="X (Twitter) promotion">Add X promotion <span className="arr">&rarr;</span></a>
              </div>
            </article>

            <article className="zz" id="svc-6">
              <div className="zz-vis tone" aria-hidden="true">
                <span className="ghost">06</span>
                <div className="mock m-cal">
                  <div className="m-calh"><b>November</b><span>Content calendar</span></div>
                  <div className="m-grid">
                    <i></i><i></i><i className="on">Guide</i><i></i><i></i><i></i><i></i>
                    <i></i><i className="on">Review</i><i></i><i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i className="on">Compare</i><i></i><i></i><i></i>
                  </div>
                </div>
              </div>
              <div className="zz-txt">
                <div className="zz-meta"><span className="zz-n">06</span><span className="zz-tag">Ongoing</span></div>
                <h3>Content <em>Packages</em></h3>
                <p>A monthly mix of articles, CTA placements and X posts for steady visibility on the topics your audience searches.</p>
                <ul className="zz-points"><li>2 to 8 articles a month</li><li>Shared content calendar</li><li>CTA and X posts bundled</li><li>Monthly performance summary</li></ul>
                <a className="btn btn-line" href="#contact" data-pick="Content package (monthly)">Plan a package <span className="arr">&rarr;</span></a>
              </div>
            </article>
          </ServicesCarousel>

          <div className="seo rv" id="svc-seo">
            <div>
              <span className="kicker">For your own website</span>
              <h3>SEO &amp; content, <em>run by the team that ranks ours.</em></h3>
              <p>We plan, write and maintain content on your site. Built for AI startups and SaaS teams without an in-house content function.</p>
              <a className="btn btn-solid" href="#contact" data-pick="SEO & content management for my site">Discuss your site <span className="arr">&rarr;</span></a>
            </div>
            <ul>
              <li><b>01</b>SEO audit: technical, on-page and content gaps</li>
              <li><b>02</b>Keyword research and topic clusters</li>
              <li><b>03</b>Blog writing for Google and AI search</li>
              <li><b>04</b>Refreshing and updating older posts</li>
              <li><b>05</b>Internal linking, schema and metadata</li>
              <li><b>06</b>Monthly Search Console reporting</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="rule">
        <div className="wrap">
          <div className="head">
            <div className="num rv">Process</div>
            <div>
              <Split>Request to <em>live in days.</em></Split>
            </div>
          </div>
          <div className="steps rv">
            <div className="bar"></div>
            <div className="step"><div className="dot">1</div><h4>Request</h4><p>Tell us the service, target URL and topic idea.</p></div>
            <div className="step"><div className="dot">2</div><h4>Quote</h4><p>We review your site and reply within 2 working days.</p></div>
            <div className="step"><div className="dot">3</div><h4>Topic</h4><p>We agree on the title, angle and link position.</p></div>
            <div className="step"><div className="dot">4</div><h4>Draft</h4><p>We write or edit it. One review round is included.</p></div>
            <div className="step"><div className="dot">5</div><h4>Payment</h4><p>The invoice is cleared before the article goes live.</p></div>
            <div className="step"><div className="dot">6</div><h4>Publish</h4><p>You get the live URL, plus social posts if included.</p></div>
          </div>
          <div className="doc-links rv d2">
            <Link className="doc-card" href="/partnerships/guidelines">
              <span>
                <b>Article guidelines</b>
                <small>Topics, format, links and images</small>
              </span>
              <i aria-hidden="true">&rarr;</i>
            </Link>
            <Link className="doc-card" href="/partnerships/terms">
              <span>
                <b>Terms &amp; conditions</b>
                <small>Payment, refunds and content rights</small>
              </span>
              <i aria-hidden="true">&rarr;</i>
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="rule">
        <div className="wrap">
          <div className="contact">
            <div className="contact-side rv">
              <span className="kicker">Contact</span>
              <h3>Send a <em>request.</em></h3>
              <p>We reply within 2 working days.</p>
              <div className="alt">
                <span className="fl">Or email</span>
                <a className="mail link" href="mailto:sanjeev@buildfastwithai.com">sanjeev@buildfastwithai.com</a>
              </div>
            </div>
            <InquiryForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="rule">
        <div className="wrap">
          <div className="head">
            <div className="num rv">FAQ</div>
            <div><Split>Common <em>questions.</em></Split></div>
          </div>
          <div className="faq rv">
            {FAQS.map((f) => (
              <details key={f.question}>
                <summary>{f.question}<i></i></summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
