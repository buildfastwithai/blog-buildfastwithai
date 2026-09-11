// app/providers.js
"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog after component mounts (lazy load)
    if (typeof window !== "undefined" && !posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        // Route ingestion + assets (recorder.js, array.js) through our own
        // domain via the Next.js rewrites in next.config.ts. This stops ad
        // blockers from blocking the session-replay recorder script, which
        // was the cause of "[SessionRecording] could not load recorder".
        api_host: "/ingest",
        // ui_host must point at PostHog's real domain so the toolbar works.
        ui_host: "https://us.posthog.com",
        person_profiles: "always",
        // Dead-clicks autocapture injects an external <script> into <body>
        // that races with React hydration -> hydration mismatch. We don't use
        // it, so keep it off. Session replay is loaded lazily post-hydration.
        capture_performance: { web_vitals: false },
        capture_dead_clicks: false,
        // /decide is PostHog's feature-flag + remote-config call. It fires on
        // every pageview (~35K/day) and we use zero feature flags — there is no
        // useFeatureFlag / isFeatureEnabled / getFeatureFlag / onFeatureFlags
        // anywhere in src/.
        //
        // MUST be removed if anyone starts using PostHog feature flags,
        // experiments, or remote config — they silently stop working with this
        // enabled.
        advanced_disable_decide: true,
        // Load PostHog after page is interactive
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") posthog.debug();
        },
      });
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export default CSPostHogProvider;
