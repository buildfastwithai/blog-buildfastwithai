import React from "react";

type JsonLdProps = {
  data: Record<string, unknown> | { "@graph": unknown[] };
};

/**
 * JSON.stringify for an inline <script>. Plain JSON.stringify leaves `<` as
 * is, so a title containing `</script><script>…` would close this tag and run
 * whatever follows. Escaping <, > and & (plus the two line separators some
 * engines treat as newlines) keeps the output valid JSON that parses to the
 * same data, with nothing the HTML parser can act on.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Component to inject JSON-LD structured data into the page
 * Should be used in server components for SEO
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
