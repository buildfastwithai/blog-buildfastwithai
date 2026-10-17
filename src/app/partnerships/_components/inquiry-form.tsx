"use client";

import { useActionState, useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import {
  submitPartnershipRequest,
  type PartnershipFormState,
} from "@/actions/partnership.actions";

const SERVICES: { value: string; label: string }[] = [
  { value: "Sponsored article / guest post", label: "Article / guest post" },
  { value: "Contextual mention", label: "Contextual mention" },
  { value: "In-blog CTA placement", label: "In-blog CTA" },
  { value: "Tool review / feature", label: "Tool review" },
  { value: "X (Twitter) promotion", label: "X promotion" },
  { value: "Content package (monthly)", label: "Content package" },
  { value: "SEO & content management for my site", label: "SEO for my site" },
];

const initial: PartnershipFormState = { status: "idle", message: "" };

export function InquiryForm() {
  const [state, action, pending] = useActionState(submitPartnershipRequest, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const posthog = usePostHog();

  // "Request ..." buttons elsewhere on the page tick the matching service.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-pick]");
      const form = formRef.current;
      if (!el || !form) return;
      const value = el.getAttribute("data-pick");
      form
        .querySelectorAll<HTMLInputElement>('input[name="services"]')
        .forEach((c) => {
          if (c.value === value) c.checked = true;
        });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      posthog?.capture("partnership_request_submitted");
    }
  }, [state, posthog]);

  return (
    <form ref={formRef} action={action} className="rv d1">
      <div className="row">
        <div className="field">
          <label htmlFor="f-name">Your name</label>
          <input id="f-name" name="name" required autoComplete="name" maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="f-email">Work email</label>
          <input id="f-email" name="email" type="email" required autoComplete="email" maxLength={200} />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="f-company">Company / brand</label>
          <input id="f-company" name="company" autoComplete="organization" maxLength={160} />
        </div>
        <div className="field">
          <label htmlFor="f-site">Your website</label>
          <input id="f-site" name="website" type="url" placeholder="https://" maxLength={300} />
        </div>
      </div>

      <div className="field">
        <span className="fl">What do you need?</span>
        <div className="checks">
          {SERVICES.map((s) => (
            <label key={s.value}>
              <input type="checkbox" name="services" value={s.value} />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="f-target">Target URL(s)</label>
        <input id="f-target" name="target" maxLength={600} />
      </div>
      <div className="field">
        <label htmlFor="f-topic">Topic or details</label>
        <textarea
          id="f-topic"
          name="details"
          maxLength={3000}
          rows={2}
          placeholder="Topic ideas, or what you need."
        />
      </div>

      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-url">Leave this empty</label>
        <input id="f-url" name="company_url" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form-foot">
        <button className="btn btn-solid" type="submit" disabled={pending}>
          {pending ? "Sending..." : "Send request"} <span className="arr">&rarr;</span>
        </button>
      </div>

      <div aria-live="polite">
        {state.status === "success" && (
          <div className="ok" style={{ display: "block" }}>
            {state.message}
          </div>
        )}
        {state.status === "error" && <div className="form-err">{state.message}</div>}
      </div>
    </form>
  );
}
