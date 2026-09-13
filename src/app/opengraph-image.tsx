import { ImageResponse } from "next/og";
import { OG_LOGO_DATA_URI } from "@/lib/og-logo";

/**
 * Site-wide Open Graph image (1200×630), rendered from code so it stays sharp,
 * on-brand and editable without a design tool. Used by the landing page,
 * /all and collection pages; articles use their own cover image.
 *
 * Generated once at build and served statically.
 */
export const alt = "Build Fast with AI Blog — latest AI news, models and code tutorials";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND_BLUE = "#1CA4F1";
const PRIMARY = "#5B7CE6"; // ≈ oklch(0.5856 0.1333 259) — the blog's --primary

async function loadFont(weight: 500 | 700): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [inter500, inter700] = await Promise.all([loadFont(500), loadFont(700)]);
  const logo = OG_LOGO_DATA_URI;

  const fonts = [
    inter500 && { name: "Inter", data: inter500, weight: 500 as const, style: "normal" as const },
    inter700 && { name: "Inter", data: inter700, weight: 700 as const, style: "normal" as const },
  ].filter(Boolean) as NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0A1020 0%, #0F172A 55%, #141B3A 100%)",
        color: "#F8FAFC",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Glows */}
      <div
        style={{
          position: "absolute",
          top: -220,
          right: -160,
          width: 640,
          height: 640,
          borderRadius: 9999,
          background: `radial-gradient(circle, ${PRIMARY}66 0%, ${PRIMARY}00 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -260,
          left: -120,
          width: 560,
          height: 560,
          borderRadius: 9999,
          background: `radial-gradient(circle, ${BRAND_BLUE}4D 0%, ${BRAND_BLUE}00 65%)`,
        }}
      />
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${BRAND_BLUE}, ${PRIMARY}, #A78BFA)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "56px 72px 52px",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={132} height={95} alt="" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#CBD5E1",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 9999, background: BRAND_BLUE }} />
            The AI Blog
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 980 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -2.5,
            }}
          >
            Latest AI news, models
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -2.5,
              color: "transparent",
              backgroundClip: "text",
              backgroundImage: `linear-gradient(90deg, ${BRAND_BLUE}, ${PRIMARY} 55%, #C4B5FD)`,
            }}
          >
            & code tutorials.
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 500, color: "#94A3B8", marginTop: 6 }}>
            Hands-on guides for people who build with AI — every week.
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {["Model breakdowns", "Code tutorials", "AI tools"].map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(15,23,42,0.6)",
                  fontSize: 20,
                  fontWeight: 500,
                  color: "#E2E8F0",
                }}
              >
                {chip}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: "#94A3B8", letterSpacing: 0.5 }}>
            blog.buildfastwithai.com
          </div>
        </div>
      </div>
    </div>,
    { ...size, fonts: fonts && fonts.length ? fonts : undefined },
  );
}
