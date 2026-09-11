import React from "react";

type JsonLdProps = {
  data: Record<string, unknown> | { "@graph": unknown[] };
};

/**
 * Component to inject JSON-LD structured data into the page
 * Should be used in server components for SEO
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
