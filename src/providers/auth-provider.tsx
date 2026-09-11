"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const posthog = usePostHog();
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    // Initialize Supabase client on mount to avoid Math.random() during SSR
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED"
      ) {
        // Refresh the page to update the server component
        if (event === "SIGNED_IN") {
          posthog?.identify(session?.user.id, {
            name: session?.user.user_metadata.full_name || "",
            supabase_user_id: session?.user.id,
            email: session?.user.email,
          });
        }

        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, posthog]);

  return <>{children}</>;
}
