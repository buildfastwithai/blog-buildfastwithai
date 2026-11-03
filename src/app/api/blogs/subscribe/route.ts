import { getStaticSupabaseClient } from "@/utils/supabase/static";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // This is an unauthenticated public endpoint that writes to the database,
    // so without a cap a single script can drive unbounded invocations and
    // rows. Five signups per IP per 10 minutes is far above real human use.
    const limit = rateLimit({
      key: `blog-subscribe:${getClientIp(request.headers)}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation (254 is the longest valid address)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 254 || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // No session is involved in a newsletter signup, so the cookie-free
    // client is enough (and keeps this route free of next/headers).
    const supabase = getStaticSupabaseClient();

    // New and existing subscribers get the SAME response below, so this
    // endpoint can't be used to test whether an address is on the list.
    //
    // The look-up only avoids inserting a duplicate row. It relies on anon
    // being able to SELECT blogs_subscriber, which it should not; once that is
    // locked down it simply finds nothing, and a unique constraint on email
    // (23505, handled below) keeps duplicates out instead.
    // maybeSingle, not single: `single()` errors on 0 rows.
    const { data: existingSubscriber } = await supabase
      .from("blogs_subscriber")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!existingSubscriber) {
      // No .select(): the inserted row is never read back or returned.
      const { error } = await supabase
        .from("blogs_subscriber")
        .insert([{ email }]);

      if (error && error.code !== "23505") {
        console.error("Error inserting subscriber:", error.code, error.message);
        return NextResponse.json(
          { error: "Failed to subscribe. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Thanks for subscribing! You're on the list." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Blog subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
