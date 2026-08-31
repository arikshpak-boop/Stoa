"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_INBOX, ENQUIRY_TYPES, type EnquiryType } from "@/lib/contact";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [enquiryType, setEnquiryType] = useState<EnquiryType>("Dealmaker");
  const [dealValue, setDealValue] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [sentVia, setSentVia] = useState<"server" | "mail-client">("server");

  /**
   * Fallback used when the server has no delivery provider configured: hand the
   * enquiry to the visitor's own mail client, fully composed, so no one ever
   * fills this form in and has it go nowhere.
   */
  function openMailClient() {
    const subject = `Stoa enquiry — ${company} (${enquiryType})`;
    const body = [
      `Name:      ${name}`,
      `Email:     ${email}`,
      `Company:   ${company}`,
      `Type:      ${enquiryType}`,
      `Deal size: ${dealValue || "(not given)"}`,
      ``,
      message,
    ].join("\n");
    window.location.href =
      `mailto:${CONTACT_INBOX}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, enquiryType, dealValue, message, website }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        // 503 means no provider is configured server-side — that is our problem,
        // not the visitor's, so complete the enquiry through their mail client.
        if (response.status === 503) {
          openMailClient();
          setSentVia("mail-client");
          setIsSent(true);
          return;
        }
        setError(payload.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSentVia("server");
      setIsSent(true);
    } catch {
      setError(`We couldn't reach the server. Please email us directly at ${CONTACT_INBOX}.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <div className="rounded-xl border border-success/25 bg-success-tint p-9 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-success" aria-hidden="true" />
        <h2 className="mt-5 font-display text-2xl font-medium text-primary">
          {sentVia === "server" ? "Thanks — your message is on its way" : "Your email is ready to send"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {sentVia === "server" ? (
            <>We read every enquiry ourselves and usually reply within one business day.</>
          ) : (
            <>
              We've opened a pre-filled email in your mail app — press send and it reaches us. If
              nothing opened, email{" "}
              <a href={`mailto:${CONTACT_INBOX}`} className="font-semibold text-accent hover:underline">
                {CONTACT_INBOX}
              </a>{" "}
              directly.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-7 shadow-card sm:p-9" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Full name</Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Work email</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="contact-company">Firm</Label>
          <Input
            id="contact-company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            autoComplete="organization"
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="contact-deal-value">Deal value (optional)</Label>
          <Input
            id="contact-deal-value"
            value={dealValue}
            onChange={(event) => setDealValue(event.target.value)}
            placeholder="e.g. $180M"
            className="mt-1.5"
          />
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-primary">How would you use Stoa?</legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {ENQUIRY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEnquiryType(type)}
              aria-pressed={enquiryType === type}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                enquiryType === type
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-white text-muted-foreground hover:border-accent/50 hover:text-primary",
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <Label htmlFor="contact-message">How can we help?</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="mt-1.5"
          placeholder="Tell us about the transaction, the timeline, and what cover you're looking for."
          required
        />
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-md border border-destructive/25 bg-destructive-tint px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? "Sending…" : "Send Enquiry"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Or email{" "}
          <a href={`mailto:${CONTACT_INBOX}`} className="font-semibold text-accent hover:underline">
            {CONTACT_INBOX}
          </a>
        </p>
      </div>
    </form>
  );
}
