import { getStaticSupabaseClient } from "@/utils/supabase/static";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // This is an unauthenticated public endpoint that writes to the database,
    // so without a cap a single script can drive unbounded invocations and
    // rows. Five signups per IP per 10 minutes is far above real human use.
    const limit = rateLimit({
      key: `blog-subscribe:${getClientIp(request)}`,
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

    const { email } = await request.json();

    // Validate email
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // No session is involved in a newsletter signup, so the cookie-free
    // client is enough (and keeps this route free of next/headers).
    const supabase = getStaticSupabaseClient();

    // Check if email already exists
    // maybeSingle, not single: `single()` errors on 0 rows, which logged a
    // PGRST116 for every genuinely new subscriber.
    const { data: existingSubscriber } = await supabase
      .from("blogs_subscriber")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (existingSubscriber) {
      return NextResponse.json(
        { error: "You're already subscribed to our newsletter!" },
        { status: 409 }
      );
    }

    // Insert new subscriber
    const { data, error } = await supabase
      .from("blogs_subscriber")
      .insert([
        {
          email: email.trim().toLowerCase(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting subscriber:", error);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Successfully subscribed to our newsletter!",
        subscriber: data 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Blog subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
