import "server-only";
import { Resend } from "resend";
import { siteUrl } from "@/lib/utils";

const key = process.env.RESEND_API_KEY;
const resend = key ? new Resend(key) : null;
const from = process.env.EMAIL_FROM ?? "Mamon Brews <onboarding@resend.dev>";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function layout(title: string, rows: [string, string][], cta?: { label: string; href: string }) {
  const body = rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b6b63;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#141613">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("");
  return `<div style="background:#F5EFE3;padding:32px;font-family:Helvetica,Arial,sans-serif"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:28px">
<p style="margin:0 0 4px;color:#A8242C;font-size:12px;letter-spacing:2px;text-transform:uppercase">Mamon Brews</p>
<h1 style="margin:0 0 18px;font-family:Georgia,serif;font-weight:400;color:#1F3A2B">${esc(title)}</h1>
<table style="border-collapse:collapse;font-size:14px">${body}</table>
${cta ? `<p style="margin-top:24px"><a href="${cta.href}" style="background:#1F3A2B;color:#F5EFE3;padding:12px 18px;border-radius:999px;text-decoration:none">${esc(cta.label)}</a></p>` : ""}
</div></div>`;
}

async function send(to: string | undefined | null, subject: string, html: string) {
  if (!resend || !to) return;
  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (e) {
    console.error("Email failed", e);
  }
}

export async function notifyOwner(subject: string, title: string, rows: [string, string][], adminPath: string) {
  await send(process.env.OWNER_NOTIFY_EMAIL, subject, layout(title, rows, { label: "Open in admin", href: siteUrl(adminPath) }));
}

export async function confirmToCustomer(email: string | null | undefined, subject: string, title: string, rows: [string, string][]) {
  await send(email, subject, layout(title, rows));
}
