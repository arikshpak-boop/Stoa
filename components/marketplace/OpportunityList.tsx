"use client";

import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OpportunityCard } from "@/components/marketplace/OpportunityCard";
import type { Deal, RiskLevel, Sector } from "@/lib/types";

const SECTOR_OPTIONS: Array<Sector | "All Sectors"> = [
  "All Sectors",
  "SaaS / Technology",
  "Manufacturing",
  "Healthcare",
  "Financial Services",
  "Consumer & Retail",
  "Energy & Natural Resources",
  "Business Services",
];

const RISK_APPETITE_OPTIONS: Array<RiskLevel | "Any Risk Appetite"> = ["Any Risk Appetite", "Low", "Medium", "High"];

const VALUE_BANDS = [
  { label: "All Deal Values", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Under $100M", min: 0, max: 100_000_000 },
  { label: "$100M – $300M", min: 100_000_000, max: 300_000_000 },
  { label: "Over $300M", min: 300_000_000, max: Number.POSITIVE_INFINITY },
] as const;

function highestRiskLevel(deal: Deal): RiskLevel {
  if (deal.warranties.some((w) => w.riskLevel === "High")) return "High";
  if (deal.warranties.some((w) => w.riskLevel === "Medium")) return "Medium";
  return "Low";
}

export function OpportunityList({ deals }: { deals: Deal[] }) {
  const [sectorFilter, setSectorFilter] = useState<Sector | "All Sectors">("All Sectors");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "Any Risk Appetite">("Any Risk Appetite");
  const [valueBandLabel, setValueBandLabel] = useState<(typeof VALUE_BANDS)[number]["label"]>("All Deal Values");

  const filteredDeals = useMemo(() => {
    const band = VALUE_BANDS.find((b) => b.label === valueBandLabel) ?? VALUE_BANDS[0];
    return deals.filter((deal) => {
      const matchesSector = sectorFilter === "All Sectors" || deal.target.sector === sectorFilter;
      const matchesRisk = riskFilter === "Any Risk Appetite" || highestRiskLevel(deal) === riskFilter;
      const matchesValue = deal.financials.enterpriseValue >= band.min && deal.financials.enterpriseValue < band.max;
      return matchesSector && matchesRisk && matchesValue;
    });
  }, [deals, sectorFilter, riskFilter, valueBandLabel]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-primary">Open Bidding Opportunities</h2>
          <p className="text-sm text-muted-foreground">
            {filteredDeals.length} deal{filteredDeals.length === 1 ? "" : "s"} available for bidding
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <span className="label-uppercase block" id="sector-filter-label">Sector</span>
          <Select value={sectorFilter} onValueChange={(value) => setSectorFilter(value as Sector | "All Sectors")}>
            <SelectTrigger className="w-48" aria-labelledby="sector-filter-label"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SECTOR_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <span className="label-uppercase block" id="risk-filter-label">Risk Appetite</span>
          <Select value={riskFilter} onValueChange={(value) => setRiskFilter(value as RiskLevel | "Any Risk Appetite")}>
            <SelectTrigger className="w-40" aria-labelledby="risk-filter-label"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RISK_APPETITE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <span className="label-uppercase block" id="value-filter-label">Deal Value</span>
          <Select value={valueBandLabel} onValueChange={(value) => setValueBandLabel(value as typeof valueBandLabel)}>
            <SelectTrigger className="w-40" aria-labelledby="value-filter-label"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VALUE_BANDS.map((band) => (
                <SelectItem key={band.label} value={band.label}>{band.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {filteredDeals.map((deal) => (
          <OpportunityCard key={deal.id} deal={deal} />
        ))}
        {filteredDeals.length === 0 && (
          <div className="rounded-lg border border-border bg-white py-10 text-center text-sm text-muted-foreground">
            No deals match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
