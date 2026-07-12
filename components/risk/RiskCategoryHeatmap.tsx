import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RISK_DOMAINS, WARRANTY_DEFINITIONS, type DealWarranty, type RiskDomain } from "@/lib/types";

type Tier = "GREEN" | "AMBER" | "RED";

const TIER_VARIANT: Record<Tier, "success" | "warning" | "destructive"> = {
  GREEN: "success",
  AMBER: "warning",
  RED: "destructive",
};

const DOMAIN_TO_IDENTIFIERS: Record<RiskDomain, string[]> = RISK_DOMAINS.reduce(
  (acc, domain) => {
    acc[domain] = WARRANTY_DEFINITIONS.filter((def) => def.domain === domain).map((def) => def.identifier);
    return acc;
  },
  {} as Record<RiskDomain, string[]>,
);

function tierFor(confidence: number): Tier {
  if (confidence >= 80) return "GREEN";
  if (confidence >= 60) return "AMBER";
  return "RED";
}

export function RiskCategoryHeatmap({ warranties }: { warranties: DealWarranty[] }) {
  const rows = RISK_DOMAINS.map((domain) => {
    const identifiers = DOMAIN_TO_IDENTIFIERS[domain];
    const domainWarranties = warranties.filter((w) => identifiers.includes(w.warrantyIdentifier));
    if (domainWarranties.length === 0) return null;

    const averageSeverity =
      domainWarranties.reduce((total, w) => total + w.severityScore, 0) / domainWarranties.length;
    const confidence = Math.round(100 - averageSeverity);
    const tier = tierFor(confidence);

    return { domain, confidence, tier, warrantyCount: domainWarranties.length };
  }).filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment Heatmap</CardTitle>
        <CardDescription>Warranty compliance by category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-border">
        {rows.map((row) => (
          <div key={row.domain} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  row.tier === "GREEN" ? "bg-success" : row.tier === "AMBER" ? "bg-warning" : "bg-destructive"
                }`}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-primary">{row.domain}</p>
                <p className="text-xs text-muted-foreground">{row.warrantyCount} warrant{row.warrantyCount === 1 ? "y" : "ies"} mapped</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-primary">{row.confidence}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Confidence</p>
              </div>
              <Badge variant={TIER_VARIANT[row.tier]}>{row.tier}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
