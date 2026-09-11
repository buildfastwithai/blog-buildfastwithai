"use client";

import dynamic from "next/dynamic";

// Client-only: the dialog reads window/localStorage via the Supabase browser
// client, so it must not be server-rendered.
export const LoginForm = dynamic(() => import("@/components/login-form"), {
  ssr: false,
});
