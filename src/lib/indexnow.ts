import { BLOG_SITE_URL } from "@/lib/urls";

/**
 * IndexNow: tell Bing, Yandex, Naver and Seznam that URLs changed, instead
 * of waiting for them to recrawl. (Google does not use IndexNow.)
 *
 * Protocol: https://www.indexnow.org/documentation
 *   1. Pick any key (8 to 128 chars, [a-zA-Z0-9-]) and set INDEXNOW_KEY.
 *   2. The host must serve a text file containing that key; ours is
 *      /indexnow-key.txt (see src/app/indexnow-key.txt/route.ts) and is
 *      passed as `keyLocation` so the key file need not live at /<key>.txt.
 *   3. POST the changed URLs to api.indexnow.org, which fans out to every
 *      participating engine.
 *
 * Unset INDEXNOW_KEY disables this entirely (returns "skipped").
 */
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";

export async function submitToIndexNow(
  urls: string[],
): Promise<{ status: "skipped" | "ok" | "error"; detail?: string }> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return { status: "skipped", detail: "INDEXNOW_KEY not set" };

  const host = new URL(BLOG_SITE_URL).host;
  const urlList = Array.from(
    new Set(urls.filter((u) => u.startsWith(BLOG_SITE_URL))),
  );
  if (urlList.length === 0) return { status: "skipped", detail: "no urls" };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${BLOG_SITE_URL}${INDEXNOW_KEY_PATH}`,
        urlList,
      }),
      cache: "no-store",
    });
    // 200 = ok, 202 = accepted (key not yet validated). Anything else means
    // a bad key/keyLocation or a malformed URL list; surface it in the logs.
    if (res.status === 200 || res.status === 202) return { status: "ok" };
    const text = await res.text().catch(() => "");
    console.error("IndexNow rejected submission:", res.status, text);
    return { status: "error", detail: `${res.status} ${text}`.trim() };
  } catch (error) {
    console.error("IndexNow request failed:", error);
    return {
      status: "error",
      detail: error instanceof Error ? error.message : "unknown error",
    };
  }
}
