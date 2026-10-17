import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogUrl, MAIN_SITE_URL } from "@/lib/urls";
import { combineSchemas, generateBreadcrumbSchema } from "@/utils/seo/json-ld";
import { Reveal } from "../_components/reveal";
import { Closing } from "../_components/site-header";
import { Split } from "../_components/split";
import { partnershipMetadata, webPageSchema } from "../_lib/seo";

const TITLE = "AI Guest Post Guidelines: Topics, Format & Links";
const DESCRIPTION =
  "Guest post guidelines for Build Fast with AI: accepted topics, 2,500 to 4,000 word format, article template, link policy, images and how to submit.";

export const metadata: Metadata = partnershipMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/partnerships/guidelines",
  socialTitle: "Guest Post Guidelines & Article Format | Build Fast with AI",
  keywords: [
    "guest post guidelines",
    "write for us guidelines",
    "AI guest post",
    "article format",
    "guest post template",
    "link policy",
    "sponsored post guidelines",
  ],
});

const TOC = [
  ["g-topics", "Topics we accept"],
  ["g-quality", "Quality standards"],
  ["g-format", "Article format"],
  ["g-template", "Article template"],
  ["g-links", "Link policy"],
  ["g-byline", "Bylines"],
  ["g-images", "Images"],
  ["g-submit", "How to submit"],
];

export default function GuidelinesPage() {
  const schema = combineSchemas(
    webPageSchema({ name: TITLE, description: DESCRIPTION, path: "/partnerships/guidelines" }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: MAIN_SITE_URL },
        { name: "Blog", url: blogUrl("/") },
        { name: "Partnerships", url: blogUrl("/partnerships") },
        { name: "Guidelines", url: blogUrl("/partnerships/guidelines") },
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
          <span className="crumb">Partnerships / Guidelines</span>
        </div>
      </div>

      <section id="guidelines">
        <div className="wrap">
          <div className="head">
            <div className="num rv">Guidelines</div>
            <div>
              <Split as="h1">Guest post guidelines <em>&amp; article format.</em></Split>
            </div>
          </div>
          <div className="doc">
            <nav className="toc" aria-label="Guidelines contents">
              <b>Contents</b>
              {TOC.map(([id, label]) => (
                <a key={id} href={`#${id}`}>{label}</a>
              ))}
            </nav>
            <div>
              <div className="blk rv" id="g-topics">
                <h3><span className="bn">01</span>Topics we accept</h3>
                <div className="yn">
                  <div className="y"><h4>Yes, please</h4>
                    <ul><li>AI models, tools and reviews</li><li>LLM APIs, agents and automation</li><li>Prompt engineering and prompt packs</li><li>Developer tutorials and coding with AI</li><li>AI for business, marketing and productivity</li><li>Model comparisons, cost and benchmarks</li><li>AI careers, skills and learning</li></ul>
                  </div>
                  <div className="n"><h4>We do not publish</h4>
                    <ul><li>Casino, betting or gambling</li><li>Adult content or dating</li><li>CBD, pharma or unverified health claims</li><li>Crypto schemes, loans or get-rich offers</li><li>Essay mills, hacking or cracked software</li><li>Pure sales pages or press releases</li></ul>
                  </div>
                </div>
              </div>

              <div className="blk rv" id="g-quality">
                <h3><span className="bn">02</span>Quality standards</h3>
                <ul>
                  <li><b>Original and exclusive.</b> Never published elsewhere, and not republished after it goes live with us.</li>
                  <li><b>Useful first.</b> Teach something specific: steps, examples, numbers, screenshots or code.</li>
                  <li><b>Human-edited.</b> AI-assisted drafting is fine. Raw AI output is rejected.</li>
                  <li><b>Accurate and current.</b> Facts, pricing and model names correct at submission, with sources linked.</li>
                  <li><b>Plain, direct voice.</b> Short sentences, active voice, no keyword stuffing or clickbait.</li>
                  <li><b>Natural brand mentions.</b> Your product appears where it genuinely helps the reader.</li>
                </ul>
              </div>

              <div className="blk rv" id="g-format">
                <h3><span className="bn">03</span>Article format</h3>
                <table>
                  <tbody>
                    <tr><th>Element</th><th>Requirement</th></tr>
                    <tr><td>Length</td><td>2,500 to 4,000 words.</td></tr>
                    <tr><td>Title (H1)</td><td>Under 65 characters, main keyword included.</td></tr>
                    <tr><td>Meta description</td><td>140 to 155 characters, summarizes the answer.</td></tr>
                    <tr><td>Quick answer</td><td>40 to 60 word direct answer near the top, for Google and AI search.</td></tr>
                    <tr><td>Structure</td><td>Short intro, then H2 and H3 sections. Paragraphs of 2 to 4 sentences.</td></tr>
                    <tr><td>FAQ</td><td>3 to 5 real questions with short answers.</td></tr>
                    <tr><td>Sources</td><td>Primary sources linked: official docs, research, company posts.</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="blk rv" id="g-template">
                <h3><span className="bn">04</span>Article template</h3>
                <p>Use this outline in your Google Doc. Keep the order.</p>
                <div className="tpl">
                  <span className="c"># Meta</span>{"\n"}
                  {"Title (H1):          under 65 characters, main keyword included\n"}
                  {"Meta description:    140 to 155 characters\n"}
                  {"Target keyword:      1 primary + 2 to 3 secondary\n"}
                  {"Suggested URL slug:  short-keyword-slug\n\n"}
                  <span className="c"># Article</span>{"\n"}
                  {"H1  Title\n"}
                  {"    Quick answer (40 to 60 words)\n"}
                  {"    Intro (2 to 3 short paragraphs)\n"}
                  {"H2  Section 1  (core concept or first step)\n"}
                  {"    H3  Sub-point with example / screenshot / code\n"}
                  {"H2  Section 2\n"}
                  {"H2  Section 3  (comparison table or step-by-step)\n"}
                  {"H2  Key takeaways (3 to 5 bullets)\n"}
                  {"H2  FAQ (3 to 5 questions)\n"}
                  {"    Sources\n\n"}
                  <span className="c"># Extras</span>{"\n"}
                  {"Links:        max 2 contextual links with exact anchor text\n"}
                  {"Images:       1 cover (16:9) + in-article images (any size) with alt text"}
                </div>
              </div>

              <div className="blk rv" id="g-links">
                <h3><span className="bn">05</span>Link policy</h3>
                <ul>
                  <li><b>Maximum 2 dofollow links</b> per article, in the body where they help the reader.</li>
                  <li><b>Paid placements</b> carry <code>rel=&quot;sponsored&quot;</code>, in line with Google&apos;s paid-link guidelines.</li>
                  <li><b>Anchor text</b> must read naturally. No exact-match stuffing, no link in the first sentence.</li>
                  <li><b>Target pages</b> must be live, HTTPS, safe and relevant. No affiliate or redirect links.</li>
                  <li><b>Internal links:</b> we add 2 to 3 links to related Build Fast with AI articles.</li>
                </ul>
              </div>

              <div className="blk rv" id="g-byline">
                <h3><span className="bn">06</span>Bylines</h3>
                <ul>
                  <li><b>Sponsored articles and tool reviews</b> are written by our team and published under the Build Fast with AI editorial byline, marked as sponsored.</li>
                </ul>
              </div>

              <div className="blk rv" id="g-images">
                <h3><span className="bn">07</span>Images</h3>
                <ul>
                  <li>Only images you own or have rights to use.</li>
                  <li>Cover image in a 16:9 ratio (for example 1920 x 1080 px). In-article images can be any size.</li>
                  <li>JPG, PNG or WebP.</li>
                  <li>Descriptive alt text on every image. No watermarks.</li>
                </ul>
              </div>

              <div className="blk rv" id="g-submit">
                <h3><span className="bn">08</span>How to submit</h3>
                <ul>
                  <li>Pitch first: send 2 to 3 topic ideas through the form. No full drafts before approval.</li>
                  <li>After approval, share the article as an editable <b>Google Doc</b>.</li>
                  <li>We may edit for clarity, SEO, length and style. Major changes are shared before publishing.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Closing kicker="Next step">
        <Split>Have a topic? <em>Pitch it.</em></Split>
      </Closing>
    </>
  );
}
