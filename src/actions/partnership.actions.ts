"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";
import { appendPartnershipRow } from "@/lib/partnership-sheet";

/** Inboxes that receive every partnership request. */
const PARTNERSHIP_TO_EMAILS = ["sanjeev@buildfastwithai.com"];

/** Sender address for the notification (domain is verified in Resend). */
const PARTNERSHIP_FROM = "Build Fast with AI <hello@buildfastwithai.com>";

export type PartnershipFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const ALLOWED_SERVICES = new Set([
  "Sponsored article / guest post",
  "Contextual mention",
  "In-blog CTA placement",
  "Tool review / feature",
  "X (Twitter) promotion",
  "Content package (monthly)",
  "SEO & content management for my site",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const field = (fd: FormData, key: string, max: number) =>
  String(fd.get(key) ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);

export async function submitPartnershipRequest(
  _prev: PartnershipFormState,
  formData: FormData,
): Promise<PartnershipFormState> {
  // Honeypot: real visitors never see or fill this field.
  if (field(formData, "company_url", 200)) {
    return { status: "success", message: "Thanks, your request was sent." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const limit = rateLimit({ key: `partnership:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return {
      status: "error",
      message: "Too many requests from your network. Please try again later or email us directly.",
    };
  }

  const name = field(formData, "name", 120);
  const email = field(formData, "email", 200);
  if (!name) return { status: "error", message: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { status: "error", message: "Please enter a valid work email." };
  if (!formData.get("terms")) {
    return { status: "error", message: "Please confirm you have read the terms and conditions." };
  }

  const company = field(formData, "company", 160);
  const website = field(formData, "website", 300);
  const target = field(formData, "target", 600);
  const details = field(formData, "details", 3000);
  const services = formData
    .getAll("services")
    .map(String)
    .filter((s) => ALLOWED_SERVICES.has(s));

  const servicesText = services.join(", ") || "Not specified";
  const submittedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Company", company],
    ["Website", website],
    ["Services", servicesText],
    ["Target URL(s)", target],
    ["Details", details],
    ["Submitted (IST)", submittedAt],
  ];

  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#141C28">
<h2 style="margin:0 0 12px">New partnership request</h2>
<table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:640px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="border-bottom:1px solid #e5e5e5;width:160px;color:#666;vertical-align:top">${esc(k)}</td><td style="border-bottom:1px solid #e5e5e5;white-space:pre-wrap">${esc(v) || "-"}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="color:#888;font-size:12px;margin-top:16px">Sent from blog.buildfastwithai.com/partnerships. Reply to this email to answer ${esc(name)} directly.</p>
</div>`;
  const text = rows.map(([k, v]) => `${k}: ${v || "-"}`).join("\n");

  const sendEmail = async () => {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set.");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: PARTNERSHIP_FROM,
      to: PARTNERSHIP_TO_EMAILS,
      replyTo: email,
      subject: `Partnership request: ${services[0] ?? "General"}${company ? ` | ${company}` : ""}`,
      html,
      text,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
  };

  const saveRow = () =>
    appendPartnershipRow([
      submittedAt,
      name,
      email,
      company,
      website,
      servicesText,
      target,
      details,
      "blog /partnerships",
    ]);

  // Run both; a failure in one must not lose the request if the other worked.
  const [mail, sheet] = await Promise.allSettled([sendEmail(), saveRow()]);
  if (mail.status === "rejected") console.error("[Partnership] email failed:", mail.reason);
  if (sheet.status === "rejected") console.error("[Partnership] sheet failed:", sheet.reason);

  if (mail.status === "rejected" && sheet.status === "rejected") {
    return {
      status: "error",
      message: "We could not send your request. Please email sanjeev@buildfastwithai.com directly.",
    };
  }

  return {
    status: "success",
    message: "Thanks, your request is in. We reply within 2 working days.",
  };
}
