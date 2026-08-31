"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Mail, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/premium";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { WARRANTY_DEFINITIONS, type Bid, type ExclusionClause, type WarrantyIdentifier } from "@/lib/types";
import { libraryExclusionById } from "@/lib/exclusion-library";

const BID_STATUS_VARIANT: Record<Bid["bidStatus"], "muted" | "success" | "destructive"> = {
  Pending: "muted",
  Accepted: "success",
  Declined: "destructive",
};

const WARRANTY_LABEL = new Map<WarrantyIdentifier, string>(
  WARRANTY_DEFINITIONS.map((definition) => [definition.identifier, definition.label]),
);

function totalExclusions(bid: Bid): number {
  return (
    (bid.requestedExclusions ?? []).length +
    (bid.libraryExclusions ?? []).length +
    (bid.customExclusions ?? []).length
  );
}

function ExclusionEntry({ title, tag, wording }: { title: string; tag: string; wording: string }) {
  return (
    <li className="border-l-2 border-warning/40 pl-4">
      <p className="text-sm font-semibold text-primary">
        {title}
        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {tag}
        </span>
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{wording}</p>
    </li>
  );
}

interface BidComparisonViewProps {
  dealId: string;
  companyName: string;
  currency: string;
  bids: Bid[];
  exclusions: ExclusionClause[];
}

export function BidComparisonView({ companyName, currency, bids, exclusions }: BidComparisonViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = bids[activeIndex];

  const exclusionsByWarranty = useMemo(
    () => new Map(exclusions.map((clause) => [clause.warrantyIdentifier, clause])),
    [exclusions],
  );

  if (!active) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-12 text-center">
        <p className="font-sans text-lg font-semibold text-primary">No bids yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Carriers on the distribution list haven&apos;t quoted this deal yet. Use
          &ldquo;Ask for More Bids&rdquo; to chase the ones still silent.
        </p>
      </div>
    );
  }

  const requested = active.requestedExclusions ?? [];
  const library = active.libraryExclusions ?? [];
  const custom = active.customExclusions ?? [];

  /**
   * Composes the enquiry rather than just opening a blank draft. The carrier's
   * underwriting address is used when they supplied one; otherwise the
   * recipient is left for the deal maker to fill, since inventing a contact
   * address for a real market would be worse than leaving it blank.
   */
  const mailtoHref = (() => {
    const subject = `${companyName} — W&I quote query (${active.carrierName})`;
    const body = [
      `Hello ${active.carrierName},`,
      ``,
      `Regarding your quote on ${companyName}:`,
      ``,
      `  Limit:      ${formatCurrency(active.limitAmount, currency)}`,
      `  Retention:  ${formatCurrency(active.retentionAmount, currency)} (${active.retentionTrigger})`,
      `  Rate on line: ${active.rateOnLinePercent}%`,
      `  Premium:    ${formatCurrency(active.premiumTotal, currency)}`,
      totalExclusions(active) > 0
        ? `  Exclusions requested: ${[
            ...requested.map((id) => WARRANTY_LABEL.get(id) ?? id),
            ...library.map((id) => libraryExclusionById(id)?.name ?? id),
            ...custom.map((exclusion) => exclusion.title),
          ].join(", ")}`
        : `  Exclusions requested: none`,
      ``,
      `We'd like to discuss the following:`,
      ``,
    ].join("\n");
    return `mailto:${active.carrierContactEmail ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  })();

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
      {/* Bid rail */}
      <nav aria-label="Bids received" className="space-y-2">
        {bids.map((bid, index) => (
          <button
            key={bid.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-current={index === activeIndex ? "true" : undefined}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              index === activeIndex
                ? "border-accent bg-accent-tint"
                : "border-border bg-white hover:border-accent/40 hover:bg-muted",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={cn("text-sm font-semibold", index === activeIndex ? "text-accent" : "text-primary")}>
                {bid.carrierName}
              </span>
              <Badge variant={BID_STATUS_VARIANT[bid.bidStatus]}>{bid.bidStatus}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatCurrency(bid.premiumTotal, currency)} premium · {bid.rateOnLinePercent}% RoL
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalExclusions(bid)} exclusion{totalExclusions(bid) === 1 ? "" : "s"} requested
            </p>
          </button>
        ))}
      </nav>

      {/* Detail */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-medium text-primary">{active.carrierName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted {formatDate(active.submittedAt)} · Bid {activeIndex + 1} of {bids.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="neutral"
              size="icon"
              aria-label="Previous bid"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="neutral"
              size="icon"
              aria-label="Next bid"
              disabled={activeIndex === bids.length - 1}
              onClick={() => setActiveIndex((i) => Math.min(bids.length - 1, i + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button asChild>
              <a href={mailtoHref}>
                <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                Contact Carrier
              </a>
            </Button>
          </div>
        </div>

        {/* Quote terms */}
        <div className="mt-6 rounded-lg border border-border bg-white p-6">
          <p className="label-uppercase">Quote</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {[
              ["Limit of liability", formatCurrency(active.limitAmount, currency)],
              ["Limit % of EV", `${active.limitPercentOfEv}%`],
              ["Retention", `${formatCurrency(active.retentionAmount, currency)} · ${active.retentionTrigger}`],
              ["Rate on line", `${active.rateOnLinePercent}%`],
              ["Gross premium", formatCurrency(active.premiumTotal, currency)],
              ["Underwriting fees", formatCurrency(active.underwritingFees, currency)],
              ["Expense cap", formatCurrency(active.expenseCap, currency)],
              ["Policy expiration", formatDate(active.policyExpiration)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Exclusions this carrier is asking for */}
        <div className="mt-6 rounded-lg border border-border bg-white p-6">
          <p className="label-uppercase flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
            Exclusions Requested
          </p>

          {totalExclusions(active) === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              This carrier has not asked for any exclusion.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {requested.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Recommended for this deal
                  </p>
                  <ul className="mt-3 space-y-4">
                    {requested.map((identifier) => {
                      const clause = exclusionsByWarranty.get(identifier);
                      return (
                        <ExclusionEntry
                          key={identifier}
                          title={clause?.title ?? WARRANTY_LABEL.get(identifier) ?? identifier}
                          tag={identifier}
                          wording={
                            clause?.draftText ??
                            "No drafted clause on the deal's exclusion report for this warranty."
                          }
                        />
                      );
                    })}
                  </ul>
                </div>
              )}

              {library.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Standard library
                  </p>
                  <ul className="mt-3 space-y-4">
                    {library.map((id) => {
                      const entry = libraryExclusionById(id);
                      return (
                        <ExclusionEntry
                          key={id}
                          title={entry?.name ?? id}
                          tag={entry ? `${entry.category} · ${entry.frequency}` : "Library"}
                          wording={entry?.wording ?? "This exclusion is no longer in the standard library."}
                        />
                      );
                    })}
                  </ul>
                </div>
              )}

              {custom.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Carrier-drafted
                  </p>
                  <ul className="mt-3 space-y-4">
                    {custom.map((exclusion, index) => (
                      <ExclusionEntry
                        key={`${exclusion.title}-${index}`}
                        title={exclusion.title}
                        tag="Custom"
                        wording={exclusion.wording}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
