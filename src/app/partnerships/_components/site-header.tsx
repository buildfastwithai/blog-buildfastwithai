import Link from "next/link";

/** Closing call-to-action used at the bottom of every partnerships page. */
export function Closing({
  kicker,
  children,
  lead,
}: {
  kicker: string;
  children: React.ReactNode;
  lead?: string;
}) {
  return (
    <section className="closing rule">
      <div className="wrap">
        <span className="kicker rv">{kicker}</span>
        {children}
        {lead && <p className="rv d2">{lead}</p>}
        <div className="hero-ctas rv d3">
          <Link className="btn btn-solid" href="/partnerships#contact">
            Send a request <span className="arr">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
