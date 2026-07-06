import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Eye, FileBarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/premium";
import { averageRiskScore, mockDocumentCount, summarizeOpportunity } from "@/lib/kpi";
import type { Deal } from "@/lib/types";

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <p className="text-sm font-semibold tabular-nums text-primary">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

export function OpportunityCard({ deal, index }: { deal: Deal; index: number }) {
  const summary = summarizeOpportunity(deal);
  const riskScore = averageRiskScore(deal);

  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/marketplace/${deal.id}`} className="font-semibold text-primary hover:text-accent">
                {deal.target.companyName}
              </Link>
              <Badge variant="outline">{deal.target.sector}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Deal Value: <span className="font-medium text-primary">{formatCurrency(deal.financials.enterpriseValue, deal.financials.currency)}</span>
              {" · "}
              {deal.organizationName}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {summary.daysUntilSigning > 0 ? `${summary.daysUntilSigning} days to signing` : "Signing date passed"}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <StatBlock label="Risk Score" value={`${riskScore} /100`} />
          <StatBlock label="Documents" value={String(mockDocumentCount(index))} />
          <StatBlock label="Warranties" value={String(deal.warranties.length)} />
          <StatBlock label="Competing Bids" value={String(deal.bids.length)} />
          <StatBlock
            label="Lowest Premium"
            value={summary.lowestBidPremium !== null ? formatCurrency(summary.lowestBidPremium, deal.financials.currency) : "—"}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {summary.clearedCount} warranties cleared
          </span>
          {summary.mediumRiskCount > 0 && (
            <span className="flex items-center gap-1 text-warning">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              {summary.mediumRiskCount} medium risk flags
            </span>
          )}
          {summary.highRiskCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              {summary.highRiskCount} high risk items
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/marketplace/${deal.id}`}>
              <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Review VDR
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/marketplace/${deal.id}#risk-report`}>
              <FileBarChart className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Risk Report
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/marketplace/${deal.id}#configure-bid`}>Submit Bid</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
