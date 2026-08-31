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
import { EyebrowBadge } from "@/components/layout/EyebrowBadge";
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

const COMPOUNDING_ADVANTAGES = [
  {
    title: "Proprietary data moat",
    description:
      "Every placement trains Stoa's underwriting and pricing models. The risk engine sharpens with each deal and gets harder to replicate over time.",
  },
  {
    title: "Two-sided network effects",
    description:
      "More carriers mean tighter, more competitive pricing; more quality deal flow attracts more carriers. The loop reinforces itself.",
  },
  {
    title: "Auditable by design",
    description:
      "SHA-256 versioned snapshots plus SOC 2, GDPR, FCA and NYDFS readiness make Stoa trusted at institutional scale across US, UK and EU.",
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

      {/* ── MOVEMENT 1 ────────────────────────────────────────────────────
          Hero, proof-rail and value props share one white ground and flow
          into each other. Previously three separate banded "slides". */}
      <section className="relative overflow-hidden">
        <div className="container-page relative pt-16 sm:pt-24">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <EyebrowBadge dotColor="accent">Institutional Trust · Algorithmic Precision</EyebrowBadge>
              <h1 className="mt-6 max-w-[14ch] text-display-md sm:text-display-lg">
                The Future of M&amp;A Insurance
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Stoa replaces traditional Warranty &amp; Indemnity underwriting and legal validation
                cycles with AI-powered due diligence, connecting dealmakers and carriers on a single,
                cryptographically auditable marketplace.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/contact">
                    Start Your First Deal
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Explore Marketplace</Link>
                </Button>
              </div>
              <p className="mt-7 flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" aria-hidden="true" />
                Uploads are encrypted, confidential, and isolated to your organisation.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:mx-0">
              <div className="blob absolute -right-8 -top-10 h-72 w-72 bg-band-sky" aria-hidden="true" />
              <div className="blob-alt absolute -bottom-12 -left-10 h-56 w-56 bg-band-tint" aria-hidden="true" />
              <div className="surface-panel relative">
                <p className="eyebrow">Live on the panel</p>
                <dl className="mt-6 space-y-6">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="flex items-baseline justify-between gap-4 border-b border-border pb-5 last:border-0 last:pb-0">
                      <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                      <dd className="font-display text-3xl font-medium tracking-tight text-primary">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Credential rail — a hairline, not a new band. */}
          <ul id="trust" className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-border pt-10">
            {CREDENTIALS.map((credential) => (
              <li key={credential} className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                {credential}
              </li>
            ))}
          </ul>

          {/* Value props carry straight on, unheaded — connective tissue. */}
          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-10 pb-20 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title}>
                <prop.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 font-sans text-base font-semibold text-primary">{prop.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOVEMENT 2: Solutions ─────────────────────────────────────────
          Heading sits left against a lede on the right, not centred. */}
      <section id="solutions" className="section bg-band-tint">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <h2 className="text-display-sm sm:text-display-md">
              One submission. Every structure your transaction needs.
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground lg:pb-2">
              Four cover structures, one verified deal file, and the same panel of carriers pricing
              against it.
            </p>
          </div>
          <div className="mt-12">
            <SolutionsTabs />
          </div>
        </div>
      </section>

      {/* ── MOVEMENT 3: Why Stoa ──────────────────────────────────────────
          Sticky heading on the left; capabilities stagger on the right so
          the grid never reads as a uniform slab. Compounding advantages
          continue the same movement rather than opening a new band. */}
      <section id="why" className="section bg-white">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow">Why Choose Stoa</p>
              <h2 className="section-title">Built for tier-1 underwriters and corporate legal teams</h2>
              <p className="section-lede">
                Every capability below exists to remove a step a human currently repeats by hand.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
              {CAPABILITIES.map((capability, index) => (
                <div key={capability.title} className={index % 2 === 1 ? "sm:mt-12" : undefined}>
                  <capability.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                  <h3 className="mt-4 font-sans text-lg font-semibold text-primary">{capability.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="compounds" className="mt-24 border-t border-border pt-14">
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              Why Stoa Compounds
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {COMPOUNDING_ADVANTAGES.map((advantage) => (
                <div key={advantage.title} className="overflow-hidden rounded-lg bg-white shadow-card transition-shadow hover:shadow-lift">
                  <span className="block h-1 w-full bg-accent" aria-hidden="true" />
                  <div className="p-7">
                    <h3 className="flex items-center gap-2.5 font-sans text-lg font-semibold text-primary">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {advantage.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{advantage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MOVEMENT 4: Process ───────────────────────────────────────────
          A connected timeline rather than four equal boxes — the shape
          itself communicates sequence. */}
      <section id="process" className="section bg-band-mist">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <h2 className="text-display-sm sm:text-display-md">
              From data room to bound policy in under seven days
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground lg:pb-2">
              Four stages, each one removing work the market currently does twice.
            </p>
          </div>

          <ol className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* The through-line that turns four cards into one sequence. */}
            <span
              className="absolute left-0 right-0 top-5 hidden h-px bg-accent/25 lg:block"
              aria-hidden="true"
            />
            {PROCESS_STEPS.map((step) => (
              <li key={step.step} className="relative">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-white">
                  {step.step}
                </span>
                <h3 className="mt-5 font-sans text-lg font-semibold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── MOVEMENT 5: Proof ─────────────────────────────────────────────
          One lead story carries the weight; two supporting stories sit
          beside it. Testimonials continue on the same ground. */}
      <section id="proof" className="section bg-white">
        <div className="container-page">
          <h2 className="max-w-3xl text-display-sm sm:text-display-md">
            What placement looks like when the file never moves
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {CASE_STUDIES.slice(0, 1).map((study) => (
              <article key={study.title} className="flex flex-col justify-between rounded-xl bg-band-tint p-9">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-accent">{study.tag}</span>
                  <h3 className="mt-5 font-display text-2xl font-medium leading-snug text-primary">{study.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">{study.detail}</p>
                </div>
                <span className="mt-8 inline-flex items-center text-sm font-semibold text-accent">
                  Read the story
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </span>
              </article>
            ))}

            <div className="flex flex-col gap-8">
              {CASE_STUDIES.slice(1).map((study) => (
                <article key={study.title} className="flex-1 border-l-2 border-accent/30 pl-6">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-accent">{study.tag}</span>
                  <h3 className="mt-3 font-sans text-lg font-semibold leading-snug text-primary">{study.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{study.detail}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-accent">
                    Read the story
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mask-fade-x mt-20 overflow-hidden">
          <ul className="flex w-max animate-marquee gap-4 px-4">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, index) => (
              <li
                key={`${testimonial.name}-${index}`}
                aria-hidden={index >= TESTIMONIALS.length}
                className="w-[360px] shrink-0 rounded-lg border border-border bg-white p-7"
              >
                <Quote className="h-4 w-4 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm leading-relaxed text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {testimonial.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── MOVEMENT 6: Two sides, then the close ─────────────────────────
          The dual-audience panels and the closing CTA are one continuous
          dark finish rather than a white slide followed by a dark slide. */}
      <section id="platform" className="bg-primary">
        <div className="container-page section">
          <h2 className="max-w-3xl text-display-sm text-white sm:text-display-md">Life of a deal</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/60">
            Two sides of the same record — neither one re-keying what the other already entered.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-white/5 p-9">
              <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
              <h3 className="mt-5 font-display text-2xl font-medium text-white">For Deal Makers</h3>
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
            <div className="rounded-xl bg-white p-9">
              <Gauge className="h-6 w-6 text-accent" aria-hidden="true" />
              <h3 className="mt-5 font-display text-2xl font-medium text-primary">For Insurance Carriers</h3>
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

          <div className="mt-20 border-t border-white/10 pt-16 text-center">
            <h2 className="text-display-sm text-white sm:text-display-md">
              Ready to bring your next deal to market?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
              Submit a transaction package and receive structured carrier bids on a fully auditable marketplace.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/contact">
                  Start Your First Deal
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="neutral" asChild>
                <Link href="/contact">Explore Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
