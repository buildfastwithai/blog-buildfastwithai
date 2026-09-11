"use server";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export interface LoginTrackingData {
  user_id: string;
  email: string | null;
  login_source: string;
  login_method: "google" | "email_password" | "email_link" | "phone_otp";
  login_type: "sign_in" | "sign_up";
  was_anonymous?: boolean;
  user_agent?: string | null;
  ip_address?: string | null;
}

/**
 * Track user login event in database — same `login_tracking` table the main
 * site writes to, so blog sign-ins show up in the same reports.
 */
export const trackLoginEvent = async (data: LoginTrackingData) => {
  try {
    const supabase = await createClient();

    // Get headers for IP and user agent if not provided
    const headersList = await headers();
    const userAgent = data.user_agent || headersList.get("user-agent");
    const ipAddress =
      data.ip_address ||
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip");

    const { error } = await supabase.from("login_tracking").insert({
      user_id: data.user_id,
      email: data.email,
      login_source: data.login_source,
      login_method: data.login_method,
      login_type: data.login_type,
      was_anonymous: data.was_anonymous || false,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    if (error) {
      console.error("[track login event error]", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[track login event exception]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
