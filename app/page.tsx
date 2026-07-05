import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileSearch,
  Gauge,
  Layers,
  ShieldCheck,
  Timer,
  Vault,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: FileSearch,
    title: "AI-Powered Underwriting",
    description: "LLM-based extraction converts raw VDR documents into a structured, field-confidence-scored underwriting grid in minutes, not weeks.",
  },
  {
    icon: Gauge,
    title: "Automated Risk Heatmaps",
    description: "Every Representation & Warranty is scored Low, Medium, or High risk using sector coefficients and disclosure-gap detection.",
  },
  {
    icon: Vault,
    title: "Immutable Audit Trail",
    description: "Every submitted deal is SHA-256 hashed into a locked version snapshot. Parameter changes create new versions — never silent overwrites.",
  },
  {
    icon: Timer,
    title: "Accelerated Timelines",
    description: "Progressive disclosure means brokers verify pre-filled data instead of re-keying it, cutting submission time from days to under 15 minutes.",
  },
  {
    icon: BadgeCheck,
    title: "Competitive Bidding",
    description: "Carriers configure Limit, Retention, and Rate on Line against a live, un-mutated risk report — premium is computed automatically.",
  },
  {
    icon: Layers,
    title: "Centralized VDR Connectivity",
    description: "Native placeholders for Intralinks, Datasite, and ShareVault keep the data room as the single source of truth.",
  },
];

const PROCESS_STEPS = [
  { step: "01", title: "Upload", description: "Drop SPA drafts, financial models, and disclosure schedules or connect a live VDR." },
  { step: "02", title: "Extraction", description: "The async extraction engine parses documents and populates the deal metadata grid." },
  { step: "03", title: "Risk Model", description: "The underwriting matrix scores every warranty and drafts specific exclusions in real time." },
  { step: "04", title: "Marketplace", description: "Carriers inspect the locked risk report and submit structured, comparable bids." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#process" className="hover:text-foreground">How It Works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-28 text-center">
        <Badge variant="outline" className="mb-6 border-accent/30 text-accent">
          Institutional Trust · Algorithmic Precision
        </Badge>
        <h1 className="text-5xl font-semibold tracking-tight text-primary sm:text-6xl">
          The Future of M&amp;A Insurance
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Stoa replaces traditional Warranty &amp; Indemnity underwriting and legal validation cycles with
          AI-powered due diligence, connecting dealmakers and carriers on a single, cryptographically
          auditable marketplace.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup?role=Broker">
              Start Your First Deal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/signup?role=Carrier">Explore Marketplace</Link>
          </Button>
        </div>
      </section>

      <section id="features" className="border-t border-border bg-muted/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-accent">Why Choose Stoa</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-2xl font-semibold tracking-tight text-primary">
            Built for tier-1 underwriters and corporate legal teams
          </p>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-border">
                <CardHeader>
                  <feature.icon className="h-6 w-6 text-accent" />
                  <CardTitle className="mt-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="border-t border-border py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-2">
          <Card className="border-border bg-primary text-primary-foreground">
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-accent" />
              <CardTitle className="mt-3 text-white">For Deal Makers</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-white/70">
              PE firms and M&amp;A advisors submit a deal once, in under 15 minutes, and receive
              structured, comparable bids from vetted carriers — without a single re-keyed field.
              <div className="mt-6">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link href="/deals">Enter Broker Portal</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader>
              <Gauge className="h-6 w-6 text-accent" />
              <CardTitle className="mt-3">For Insurance Carriers</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              Underwriters review the un-mutated deal package alongside the automated Stoa Risk
              &amp; Exclusions Report, then configure limit, retention, and rate on line in one workspace.
              <div className="mt-6">
                <Button asChild>
                  <Link href="/marketplace">Enter Carrier Portal</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="process" className="border-t border-border bg-muted/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-accent">How It Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-2xl font-semibold tracking-tight text-primary">
            From data room to bound policy in under 7 days
          </p>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="rounded-lg border border-border bg-white p-6">
                <span className="text-3xl font-semibold tracking-tight text-accent">{step.step}</span>
                <h3 className="mt-3 text-base font-semibold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-primary py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Ready to bring your next deal to market?</h2>
          <p className="mt-4 text-white/70">
            Submit a transaction package and receive structured carrier bids on a fully auditable marketplace.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup?role=Broker">Start Your First Deal</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/signup?role=Carrier">Explore Marketplace</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Logo />
          <p className="text-xs text-muted-foreground">© 2026 Stoa. Institutional-grade M&amp;A insurance infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}
