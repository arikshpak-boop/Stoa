import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileSearch,
  Gauge,
  Layers,
  Lock,
  Quote,
  ShieldCheck,
  Timer,
  Upload,
  Vault,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { SolutionsTabs } from "@/components/marketing/SolutionsTabs";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Button } from "@/components/ui/button";

const ACCEPTED_FILES =
  "SPA • APA • DISCLOSURE SCHEDULE • DD REPORT • FINANCIAL MODEL • CAP TABLE • QoE • TAX OPINION • PDF • DOCX • XLSX";

const CREDENTIALS = [
  "SOC 2 Type II",
  "ISO 27001",
  "GDPR",
  "Lloyd's Coverholder",
  "FCA Registered",
  "SHA-256 Audit Ledger",
];

const STATS = [
  { value: "1,240+", label: "Deals Quoted" },
  { value: "38", label: "Carriers on Panel" },
  { value: "$14.2B", label: "Limit Placed" },
  { value: "6.4 days", label: "Median Time to Bind" },
];

const VALUE_PROPS = [
  {
    icon: Timer,
    title: "Accelerate Placement",
    description:
      "AI extraction pre-fills the submission, so brokers verify a populated deal file instead of re-keying it. Days become minutes.",
  },
  {
    icon: Layers,
    title: "Scale Without Limits",
    description:
      "One submission reaches the whole carrier panel at once. No minimums, no parallel email threads, no version drift.",
  },
  {
    icon: Gauge,
    title: "Price With Confidence",
    description:
      "Every warranty is scored against sector coefficients and disclosure gaps, so underwriters price the risk rather than hunt for it.",
  },
  {
    icon: Vault,
    title: "Provable Delivery",
    description:
      "Each submitted package is SHA-256 hashed into a locked snapshot. Traceability from first upload to bound policy.",
  },
];

const CAPABILITIES = [
  {
    icon: FileSearch,
    title: "AI-Powered Underwriting",
    description:
      "LLM extraction turns raw data-room documents into a structured, field-confidence-scored underwriting grid in minutes, not weeks.",
  },
  {
    icon: Gauge,
    title: "Automated Risk Heatmaps",
    description:
      "Every representation & warranty is scored Low, Medium, or High using sector coefficients and disclosure-gap detection.",
  },
  {
    icon: Vault,
    title: "Immutable Audit Trail",
    description:
      "Every submitted deal is hashed into a locked version snapshot. Parameter changes create new versions — never silent overwrites.",
  },
  {
    icon: BadgeCheck,
    title: "Comparable Bidding",
    description:
      "Carriers configure limit, retention, and rate on line against one un-mutated risk report. Premium is computed automatically.",
  },
  {
    icon: Layers,
    title: "Native VDR Connectivity",
    description:
      "Intralinks, Datasite, and ShareVault connect directly, so the data room stays the single source of truth.",
  },
  {
    icon: ShieldCheck,
    title: "Tenant Isolation",
    description:
      "Row-level security isolates every broker organisation and gates carrier visibility to deals that have left draft status.",
  },
];

const PROCESS_STEPS = [
  { step: "01", title: "Upload", description: "Drop SPA drafts, financial models, and disclosure schedules — or connect a live VDR." },
  { step: "02", title: "Extraction", description: "The async extraction engine parses documents and populates the deal metadata grid." },
  { step: "03", title: "Risk Model", description: "The underwriting matrix scores every warranty and drafts specific exclusions in real time." },
  { step: "04", title: "Marketplace", description: "Carriers inspect the locked risk report and submit structured, comparable bids." },
];

const CASE_STUDIES = [
  {
    tag: "Technology",
    title: "A $340M SaaS carve-out bound in five days without a single re-keyed warranty",
    detail: "Four carrier bids returned inside 72 hours of submission.",
  },
  {
    tag: "Industrials",
    title: "Environmental exposure ring-fenced so a cross-border acquisition could still sign",
    detail: "Contingent risk isolated with a defined ceiling before signing.",
  },
  {
    tag: "Healthcare",
    title: "Reimbursement risk priced against a locked file, not a moving disclosure schedule",
    detail: "Every carrier priced the identical, hash-verified package.",
  },
];

const TESTIMONIALS = [
  { quote: "We submitted once and had four comparable bids back before the end of the week.", name: "M&A Partner, mid-market PE" },
  { quote: "The exclusions were drafted against our actual documents, not a boilerplate template.", name: "Transaction Services Lead" },
  { quote: "Underwriting a deal from a locked, hash-verified package removes the arguing about versions.", name: "W&I Underwriter" },
  { quote: "Fifteen minutes to submit. That used to be a two-day exercise in re-typing.", name: "Corporate Development Director" },
  { quote: "The risk heatmap tells us where to spend our diligence hours before we open a single PDF.", name: "Head of Underwriting, MGA" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* HERO — Xometry puts the single primary action inside a tinted panel, front and centre. */}
      <section className="bg-hero-wash">
        <div className="container-page py-16 text-center sm:py-24">
          <h1 className="mx-auto max-w-4xl text-[36px] font-bold leading-[1.15] tracking-tight text-primary sm:text-display">
            Quote M&amp;A Insurance in Minutes
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Upload your deal documents, get indicative terms from the carrier panel, and bind online.
          </p>

          <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-accent-border bg-accent-tint p-6 sm:p-8">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/signup?role=Broker">
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                Get Instant Terms
              </Link>
            </Button>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {ACCEPTED_FILES}
            </p>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              All uploads are encrypted, confidential, and isolated to your organisation.
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/signup?role=Carrier"
              className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              Underwriting W&amp;I? Join the carrier panel →
            </Link>
          </div>
        </div>

        {/* TRUST RAIL */}
        <div id="trust" className="border-t border-border/70">
          <div className="container-page py-8">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {CREDENTIALS.map((credential) => (
                <li
                  key={credential}
                  className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {credential}
                </li>
              ))}
            </ul>
            <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-subtle">
              Stoa operates a technology marketplace and is not the risk carrier. Cover is written by the licensed
              insurers on the panel. Stoa values your privacy and the confidentiality of your transaction data.
            </p>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-border bg-white">
        <div className="container-page grid grid-cols-2 divide-border py-10 sm:grid-cols-4 sm:divide-x">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-4 text-center">
              <span className="block text-[32px] font-bold leading-none tracking-tight text-primary">{stat.value}</span>
              <span className="mt-2 block text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTIONS — tabbed, the way Xometry splits Services / Use Cases. */}
      <section id="solutions" className="section">
        <div className="container-page">
          <p className="eyebrow">Solutions</p>
          <h2 className="section-title max-w-2xl">
            One submission. Every structure your transaction needs.
          </h2>
          <div className="mt-10">
            <SolutionsTabs />
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="section section-alt border-y border-border">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className="surface-card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-tint text-accent">
                  <prop.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-primary">{prop.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section id="why" className="section">
        <div className="container-page">
          <p className="eyebrow">Why Stoa</p>
          <h2 className="section-title max-w-2xl">Built for tier-1 underwriters and corporate legal teams</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((capability) => (
              <div key={capability.title} className="surface-card p-6">
                <capability.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-bold text-primary">{capability.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="section section-alt border-y border-border">
        <div className="container-page">
          <p className="eyebrow">How It Works</p>
          <h2 className="section-title max-w-2xl">From data room to bound policy in under seven days</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="surface-card p-6">
                <span className="text-[28px] font-bold leading-none tracking-tight text-accent">{step.step}</span>
                <h3 className="mt-3 text-base font-bold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF — Xometry's "Real Stories, Real Impact" rail. */}
      <section id="proof" className="section">
        <div className="container-page">
          <p className="eyebrow">Real Deals, Real Outcomes</p>
          <h2 className="section-title max-w-2xl">What placement looks like when the file never moves</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {CASE_STUDIES.map((study) => (
              <article key={study.title} className="surface-card flex flex-col p-6">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-accent">{study.tag}</span>
                <h3 className="mt-3 text-lg font-bold leading-snug text-primary">{study.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{study.detail}</p>
                <span className="mt-5 inline-flex items-center text-sm font-semibold text-accent">
                  Read the story
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL MARQUEE */}
      <section className="section-alt border-y border-border py-12">
        <div className="mask-fade-x overflow-hidden">
          <ul className="flex w-max animate-marquee gap-4 px-4">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, index) => (
              <li
                key={`${testimonial.name}-${index}`}
                aria-hidden={index >= TESTIMONIALS.length}
                className="w-[340px] shrink-0 rounded-lg border border-border bg-white p-6 shadow-card"
              >
                <Quote className="h-4 w-4 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm leading-relaxed text-foreground">“{testimonial.quote}”</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {testimonial.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DUAL AUDIENCE */}
      <section id="platform" className="section">
        <div className="container-page">
          <p className="eyebrow">Two Sides, One Record</p>
          <h2 className="section-title max-w-2xl">Life of a deal</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-primary p-8 text-white">
              <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold text-white">For Deal Makers</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                PE firms and M&amp;A advisors submit a deal once, in under fifteen minutes, and receive structured,
                comparable bids from vetted carriers — without a single re-keyed field.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/deals">Enter Broker Portal</Link>
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                  <Link href="/signup?role=Broker">Create an account</Link>
                </Button>
              </div>
            </div>
            <div className="surface-card p-8">
              <Gauge className="h-6 w-6 text-accent" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold text-primary">For Insurance Carriers</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Underwriters review the un-mutated deal package alongside the automated Stoa Risk &amp; Exclusions
                Report, then configure limit, retention, and rate on line in one workspace.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/marketplace">Enter Carrier Portal</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/signup?role=Carrier">Join the panel</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="border-t border-border bg-accent-tint">
        <div className="container-page py-16 text-center">
          <h2 className="text-[28px] font-bold tracking-tight text-primary sm:text-[32px]">
            Ready to bring your next deal to market?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Submit a transaction package and receive structured carrier bids on a fully auditable marketplace.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup?role=Broker">
                Get Instant Terms
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup?role=Carrier">Talk to Our Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
