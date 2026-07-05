import { AlertTriangle, CheckCircle2, HelpCircle, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  RISK_DOMAINS,
  WARRANTY_DEFINITIONS,
  type DealWarranty,
  type ExclusionClause,
  type RiskDomain,
  type RiskLevel,
} from "@/lib/types";

const RISK_BADGE_VARIANT: Record<RiskLevel, "success" | "warning" | "destructive"> = {
  Low: "success",
  Medium: "warning",
  High: "destructive",
};

const FLAG_ICON: Record<DealWarranty["flagStatus"], typeof CheckCircle2> = {
  Clear: CheckCircle2,
  Flagged: AlertTriangle,
  "Under Review": HelpCircle,
};

const PROGRESS_COLOR: Record<RiskLevel, string> = {
  Low: "bg-success",
  Medium: "bg-warning",
  High: "bg-destructive",
};

const RISK_RANK: Record<RiskLevel, number> = { Low: 0, Medium: 1, High: 2 };

function domainRiskLevel(warranties: DealWarranty[]): RiskLevel {
  return warranties.reduce<RiskLevel>(
    (highest, warranty) => (RISK_RANK[warranty.riskLevel] > RISK_RANK[highest] ? warranty.riskLevel : highest),
    "Low",
  );
}

interface WarrantyRowProps {
  warranty: DealWarranty;
  label: string;
  description: string;
  category: string;
  exclusion?: ExclusionClause;
}

function WarrantyRow({ warranty, label, description, category, exclusion }: WarrantyRowProps) {
  const FlagIcon = FLAG_ICON[warranty.flagStatus];

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{warranty.warrantyIdentifier}</span>
            <h4 className="text-sm font-semibold text-primary">{label}</h4>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">{category}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant={RISK_BADGE_VARIANT[warranty.riskLevel]}>{warranty.riskLevel} Risk</Badge>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Progress
          value={warranty.severityScore}
          aria-label={`${label} risk score: ${warranty.severityScore} out of 100`}
          className="flex-1"
          indicatorClassName={PROGRESS_COLOR[warranty.riskLevel]}
        />
        <span className="w-14 text-right text-xs font-semibold tabular-nums text-primary">{warranty.severityScore} / 100</span>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <FlagIcon
          aria-hidden="true"
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${warranty.flagStatus === "Flagged" ? "text-destructive" : warranty.flagStatus === "Under Review" ? "text-warning" : "text-success"}`}
        />
        <span>{warranty.complianceNotes}</span>
      </div>

      {exclusion && (
        <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-destructive">
            <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
            {exclusion.title}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{exclusion.draftText}</p>
        </div>
      )}
    </div>
  );
}

interface UnderwritingGridProps {
  warranties: DealWarranty[];
  exclusions?: ExclusionClause[];
}

export function UnderwritingGrid({ warranties, exclusions = [] }: UnderwritingGridProps) {
  const domainSections = RISK_DOMAINS.map((domain: RiskDomain) => {
    const definitions = WARRANTY_DEFINITIONS.filter((definition) => definition.domain === domain);
    const domainWarranties = definitions
      .map((definition) => warranties.find((w) => w.warrantyIdentifier === definition.identifier))
      .filter((warranty): warranty is DealWarranty => warranty !== undefined);
    return { domain, definitions, domainWarranties };
  }).filter((section) => section.domainWarranties.length > 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {domainSections.map(({ domain, definitions, domainWarranties }) => (
        <Card key={domain}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{domain}</CardTitle>
            <Badge variant={RISK_BADGE_VARIANT[domainRiskLevel(domainWarranties)]}>
              {domainRiskLevel(domainWarranties)} Risk
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {definitions.map((definition) => {
              const warranty = domainWarranties.find((w) => w.warrantyIdentifier === definition.identifier);
              if (!warranty) return null;
              const exclusion = exclusions.find((e) => e.warrantyIdentifier === definition.identifier);
              return (
                <WarrantyRow
                  key={definition.identifier}
                  warranty={warranty}
                  label={definition.label}
                  description={definition.description}
                  category={definition.category}
                  exclusion={exclusion}
                />
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
