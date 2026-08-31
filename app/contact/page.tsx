import type { Metadata } from "next";
import { Clock, Lock, Mail, ShieldCheck } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { ContactForm } from "@/components/marketing/ContactForm";
import { CONTACT_INBOX } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact Stoa | Institutional W&I Insurance Marketplace",
  description:
    "Talk to the Stoa team about warranty & indemnity, tax liability, contingent risk, and litigation buyout cover for your transaction.",
};

const ASSURANCES = [
  {
    icon: Clock,
    title: "One business day",
    description: "Every enquiry is read by the team, not a queue. We reply within one business day.",
  },
  {
    icon: Lock,
    title: "Confidential by default",
    description: "Transaction details you share stay between us. No data room access is needed to talk.",
  },
  {
    icon: ShieldCheck,
    title: "No obligation",
    description: "An enquiry is not a submission. Nothing is shown to a carrier until you decide.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="bg-hero-wash">
        <div className="container-page py-14 text-center sm:py-20">
          <p className="eyebrow">Contact Us</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-[32px] font-bold leading-[1.15] tracking-tight text-primary sm:text-[44px]">
            Let's talk about your transaction
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Tell us about the deal and we'll come back with indicative terms and the carriers best
            suited to it.
          </p>
          <p className="mt-6">
            <a
              href={`mailto:${CONTACT_INBOX}`}
              className="inline-flex items-center gap-2 text-base font-semibold text-accent hover:underline"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {CONTACT_INBOX}
            </a>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
          <ContactForm />

          <div className="space-y-6">
            {ASSURANCES.map((assurance) => (
              <div key={assurance.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent">
                  <assurance.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-primary">{assurance.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {assurance.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-accent-border bg-accent-tint p-6">
              <h2 className="text-sm font-bold text-primary">Already underwriting W&amp;I?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Carriers and MGAs join the panel through the same form — pick{" "}
                <span className="font-semibold text-primary">Carrier</span> and tell us your appetite.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
