"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/premium";
import { formatDate } from "@/lib/utils";
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

const RISK_BADGE_VARIANT: Record<RiskLevel, "success" | "warning" | "destructive"> = {
  Low: "success",
  Medium: "warning",
  High: "destructive",
};

export function CarrierDashboardTable({ deals }: { deals: Deal[] }) {
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
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <span className="label-uppercase block" id="sector-filter-label">Sector</span>
          <Select value={sectorFilter} onValueChange={(value) => setSectorFilter(value as Sector | "All Sectors")}>
            <SelectTrigger className="w-56" aria-labelledby="sector-filter-label"><SelectValue /></SelectTrigger>
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
            <SelectTrigger className="w-48" aria-labelledby="risk-filter-label"><SelectValue /></SelectTrigger>
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
            <SelectTrigger className="w-48" aria-labelledby="value-filter-label"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VALUE_BANDS.map((band) => (
                <SelectItem key={band.label} value={band.label}>{band.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span aria-live="polite" className="ml-auto pb-2 text-xs text-muted-foreground">
          {filteredDeals.length} deal{filteredDeals.length === 1 ? "" : "s"} in view
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Enterprise Value</TableHead>
              <TableHead>Risk Profile</TableHead>
              <TableHead>Signing</TableHead>
              <TableHead>Bids Received</TableHead>
              <TableHead>Risk Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeals.map((deal) => (
              <TableRow key={deal.id} className="relative">
                <TableCell>
                  <Link
                    href={`/marketplace/${deal.id}`}
                    className="font-medium text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:inset-0 after:content-['']"
                  >
                    {deal.target.companyName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{deal.target.jurisdiction}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">{deal.target.sector}</TableCell>
                <TableCell className="font-medium text-primary">
                  {formatCurrency(deal.financials.enterpriseValue, deal.financials.currency)}
                </TableCell>
                <TableCell>
                  <Badge variant={RISK_BADGE_VARIANT[highestRiskLevel(deal)]}>{highestRiskLevel(deal)} Risk</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(deal.timeline.signingDate)}</TableCell>
                <TableCell className="text-muted-foreground">{deal.bids.length}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild className="relative">
                    <Link href={`/marketplace/${deal.id}#risk-report`}>
                      <Gauge className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      Risk Report
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredDeals.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No deals match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
