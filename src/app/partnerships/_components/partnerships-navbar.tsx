"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import DarkLogo from "@/public/logo/dark.svg";

/** Navbar for the partnerships pages. Replaces the blog navbar on these routes. */
export function PartnershipsNavbar() {
  const pathname = usePathname();
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);

  const onHome = pathname === "/partnerships";
  const anchor = (hash: string) => (onHome ? hash : `/partnerships${hash}`);

  // Close the mobile panel after navigating.
  useEffect(() => setOpen(false), [pathname]);

  const links: { href: string; label: string; on?: boolean }[] = [
    { href: anchor("#numbers"), label: "Numbers" },
    { href: anchor("#services"), label: "Services" },
    { href: anchor("#process"), label: "Process" },
    { href: "/partnerships/guidelines", label: "Guidelines", on: pathname === "/partnerships/guidelines" },
    { href: "/partnerships/terms", label: "Terms", on: pathname === "/partnerships/terms" },
  ];

  const track = (name: string) => posthog?.capture(name);

  return (
    <header>
      <div className="wrap nav">
        <div className="pp-brand">
          <Link href="/" aria-label="Build Fast with AI blog" className="pp-logo-img">
            <Image src={DarkLogo} alt="Build Fast with AI" priority />
          </Link>
          <Link className="logo" href="/partnerships" onClick={() => track("partnerships_navbar_home_clicked")}>
            Partner <i>with us</i>
          </Link>
        </div>

        <nav className="nav-links" aria-label="Partnerships">
          {links.map((l) => (
            <Link key={l.label} className={`link${l.on ? " on" : ""}`} href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link className="link" href="/all" onClick={() => track("partnerships_navbar_all_blogs_clicked")}>
            All blogs
          </Link>
          <Link
            className="btn btn-solid"
            href={anchor("#contact")}
            onClick={() => track("partnerships_navbar_request_clicked")}
          >
            Send a request <span className="arr">&rarr;</span>
          </Link>
        </nav>

        <div className="pp-mobile">
          <Link className="btn btn-solid" href={anchor("#contact")}>
            Request
          </Link>
          <button
            type="button"
            className="pp-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <nav className="pp-panel" aria-label="Partnerships menu">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className={l.on ? "on" : undefined}>
              {l.label}
            </Link>
          ))}
          <Link href="/all">All blogs</Link>
        </nav>
      )}
    </header>
  );
}
