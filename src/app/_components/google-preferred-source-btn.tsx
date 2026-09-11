"use client";

import Script from "next/script";

export function GooglePreferredSourceBtn() {
  return (
    <>
      <Script
        src="https://news.google.com/swg/js/v1/publisher.js"
        strategy="afterInteractive"
      />
      <div
        {...{ "google-add-preferred-source-btn": "" }}
        className="inline-flex items-center justify-center min-w-[245px] min-h-[44px] rounded-full overflow-hidden bg-transparent [&_iframe]:!bg-transparent [&_*]:!bg-transparent"
      />
    </>
  );
}
