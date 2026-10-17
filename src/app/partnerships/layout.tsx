import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PartnershipsNavbar } from "./_components/partnerships-navbar";
import "./partnerships.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-pp-serif",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-pp-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-pp-mono",
});

export default function PartnershipsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={cn("pp", serif.variable, sans.variable, mono.variable)}>
      <PartnershipsNavbar />
      {children}
      <footer>
        <div className="wrap">
          <span>&copy; 2026 Build Fast with AI</span>
          <span>
            <Link className="link" href="/all">
              All blogs
            </Link>
            &nbsp;&middot;&nbsp;
            <Link className="link" href="/partnerships/terms">
              Terms
            </Link>
            &nbsp;&middot;&nbsp;
            <a className="link" href="mailto:sanjeev@buildfastwithai.com">
              sanjeev@buildfastwithai.com
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
