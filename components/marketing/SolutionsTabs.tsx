"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Solution {
  key: string;
  tab: string;
  headline: string;
  blurb: string;
  bullets: string[];
  stat: { value: string; label: string };
}

const WI_SOLUTION: Solution = {
  key: "wi",
  tab: "Warranty & Indemnity",
  headline: "Institutional W&I cover, priced against a locked risk file",
  blurb:
    "Buy-side and sell-side representations & warranties cover for transactions from $20M to $2B, underwritten from a single verified submission rather than a re-keyed questionnaire.",
  bullets: [
    "Every warranty scored Low / Medium / High against sector coefficients",
    "Limit, retention, and rate on line configured by the carrier in one workspace",
    "Covers enterprise values from $20M through $2B, primary and excess layers",
  ],
  stat: { value: "6.4 days", label: "median submission to bound policy" },
};

const SOLUTIONS: Solution[] = [
  WI_SOLUTION,
  {
    key: "tax",
    tab: "Tax Liability",
    headline: "Ring-fence an identified tax exposure before signing",
    blurb:
      "Transfer a specific, quantified tax position off the negotiating table so it stops consuming escrow, purchase price, or deal timeline.",
    bullets: [
      "Structured around the opinion and the quantum, not a general questionnaire",
      "Carrier questions raised and cleared inside the deal record",
      "Escrow released back into consideration at close",
    ],
    stat: { value: "$14.2B", label: "aggregate limit placed to date" },
  },
  {
    key: "contingent",
    tab: "Contingent Risk",
    headline: "Isolate a known issue so the deal can still clear",
    blurb:
      "Successor liability, regulatory findings, and disputed ownership are packaged as a discrete insurable risk with a defined ceiling.",
    bullets: [
      "Disclosure-gap detection flags the exposure before carriers see it",
      "Exclusions drafted against the actual document set, not boilerplate",
      "Every parameter change writes a new version — never a silent overwrite",
    ],
    stat: { value: "38", label: "vetted carriers and MGAs on the panel" },
  },
  {
    key: "litigation",
    tab: "Litigation Buyout",
    headline: "Move legacy claims off the balance sheet",
    blurb:
      "Adverse judgment and judgment preservation structures that let a seller close cleanly while live matters remain outstanding.",
    bullets: [
      "Matter documents ingested straight from Intralinks, Datasite, or ShareVault",
      "Comparable, structured bids instead of free-text broker emails",
      "SHA-256 snapshot of the package every carrier actually priced",
    ],
    stat: { value: "1,240+", label: "transactions quoted on the platform" },
  },
];

export function SolutionsTabs() {
  const [activeKey, setActiveKey] = useState(WI_SOLUTION.key);
  const active = SOLUTIONS.find((s) => s.key === activeKey) ?? WI_SOLUTION;

  return (
    <div>
      <div role="tablist" aria-label="Stoa solutions" className="flex flex-wrap gap-2 border-b border-border">
        {SOLUTIONS.map((solution) => {
          const isActive = solution.key === activeKey;
          return (
            <button
              key={solution.key}
              type="button"
              role="tab"
              id={`solution-tab-${solution.key}`}
              aria-selected={isActive}
              aria-controls={`solution-panel-${solution.key}`}
              onClick={() => setActiveKey(solution.key)}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {solution.tab}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`solution-panel-${active.key}`}
        aria-labelledby={`solution-tab-${active.key}`}
        className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center"
      >
        <div>
          <h3 className="text-2xl font-bold leading-snug text-primary sm:text-[28px]">{active.headline}</h3>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{active.blurb}</p>
          <ul className="mt-6 space-y-3">
            {active.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                {bullet}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/signup?role=Broker">
                Get Instant Terms
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/marketplace">Learn More</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-accent-border bg-accent-tint p-8">
          <span className="block text-[44px] font-bold leading-none tracking-tight text-accent">{active.stat.value}</span>
          <span className="mt-3 block text-sm font-semibold text-primary">{active.stat.label}</span>
          <p className="mt-6 border-t border-accent-border pt-6 text-sm leading-relaxed text-muted-foreground">
            Measured across transactions submitted through the Stoa marketplace. Figures are illustrative of the
            platform model and are not a quotation or an offer of cover.
          </p>
        </div>
      </div>
    </div>
  );
}
