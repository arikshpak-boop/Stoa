/**
 * Contact-form intake: validation plus delivery to the Stoa inbox.
 *
 * Delivery goes through Resend's REST API over plain `fetch` rather than their
 * SDK, so the feature adds no dependency to the bundle. When no API key is
 * configured the route reports that explicitly instead of pretending to send —
 * a contact form that silently drops enquiries is worse than no form at all.
 */

export const CONTACT_INBOX = "arik@stoains.com";

export const ENQUIRY_TYPES = ["Dealmaker", "Carrier", "Other"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export interface ContactSubmission {
  name: string;
  email: string;
  company: string;
  enquiryType: EnquiryType;
  dealValue?: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  name: 120,
  email: 254,
  company: 160,
  dealValue: 60,
  message: 4000,
} as const;

export function validateSubmission(input: Partial<ContactSubmission>): {
  ok: true; value: ContactSubmission;
} | {
  ok: false; error: string;
} {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const company = input.company?.trim() ?? "";
  const message = input.message?.trim() ?? "";
  const dealValue = input.dealValue?.trim() ?? "";
  const enquiryType = input.enquiryType;

  if (!name) return { ok: false, error: "Please tell us your name." };
  if (name.length > LIMITS.name) return { ok: false, error: "That name is too long." };

  if (!email) return { ok: false, error: "Please provide a work email address." };
  if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "That email address doesn't look right." };
  }

  if (!company) return { ok: false, error: "Please tell us which firm you're with." };
  if (company.length > LIMITS.company) return { ok: false, error: "That company name is too long." };

  if (!enquiryType || !ENQUIRY_TYPES.includes(enquiryType)) {
    return { ok: false, error: "Please choose how you'd be using Stoa." };
  }

  if (dealValue.length > LIMITS.dealValue) return { ok: false, error: "That deal value is too long." };

  if (!message) return { ok: false, error: "Please add a short message." };
  if (message.length > LIMITS.message) return { ok: false, error: "That message is too long." };

  return { ok: true, value: { name, email, company, enquiryType, dealValue, message } };
}

export const isContactDeliveryConfigured = Boolean(process.env.RESEND_API_KEY);

/** Plain-text body. Kept plain so it stays readable in any mail client. */
function renderBody(submission: ContactSubmission): string {
  return [
    `New enquiry from the stoains.com contact form.`,
    ``,
    `Name:     ${submission.name}`,
    `Email:    ${submission.email}`,
    `Company:  ${submission.company}`,
    `Type:     ${submission.enquiryType}`,
    `Deal size:${submission.dealValue ? ` ${submission.dealValue}` : " (not given)"}`,
    ``,
    `Message`,
    `-------`,
    submission.message,
    ``,
    `Reply directly to this email to respond to ${submission.name}.`,
  ].join("\n");
}

export async function deliverSubmission(submission: ContactSubmission): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { ok: false, error: "not_configured" };
  }

  // Must be an address on a domain verified in Resend. Falls back to Resend's
  // shared onboarding sender so the form works before domain verification.
  const from = process.env.CONTACT_FROM_EMAIL ?? "Stoa Website <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [CONTACT_INBOX],
      reply_to: submission.email,
      subject: `Stoa enquiry — ${submission.company} (${submission.enquiryType})`,
      text: renderBody(submission),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[contact] Resend rejected the message", response.status, detail);
    return { ok: false, error: "delivery_failed" };
  }

  return { ok: true };
}
