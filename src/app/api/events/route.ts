import { NextResponse } from "next/server";

// This route is called from the blog sidebar on every blog page (~30K/day) and
// had no cache config at all — every call was a fresh serverless invocation
// proxying to the Luma API, all returning the same event list.
//
// 6 hours: the blog sidebar doesn't need the event list to be instant, and
// events change a few times a week at most. Turns ~30K origin calls/day into 4.
export const revalidate = 21600; // 6 hours

export async function GET() {
  try {
    const apiKey = process.env.LUMA_API_KEY;

    if (!apiKey) {
      console.error("LUMA_API_KEY is not set");
      return NextResponse.json(
        { error: "LUMA_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Rounded to the hour so the URL stays stable and the fetch cache can hit.
    const after = new Date(
      Math.floor((Date.now() - 24 * 60 * 60 * 1000) / (60 * 60 * 1000)) *
        (60 * 60 * 1000)
    ).toISOString();

    const response = await fetch(
      `https://api.lu.ma/public/v1/calendar/list-events?after=${after}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-luma-api-key": apiKey,
        },
        next: { revalidate },
      }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error(
        `Luma API error ${response.status} ${response.statusText}: ${body}`
      );
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
