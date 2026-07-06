import Link from "next/link";
import { Upload, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { averageRiskScoreOutOfTen, daysActive } from "@/lib/kpi";
import { DEAL_STATUS_DISPLAY } from "@/lib/deal-status-display";
import type { Deal } from "@/lib/types";

function riskScoreColor(score: number): string {
  if (score >= 7) return "bg-destructive";
  if (score >= 4) return "bg-warning";
  return "bg-success";
}

export function DealPortfolioCard({ deal }: { deal: Deal }) {
  const statusDisplay = DEAL_STATUS_DISPLAY[deal.status];
  const riskScore = averageRiskScoreOutOfTen(deal);
  const activeBidCount = deal.bids.filter((bid) => bid.bidStatus === "Pending").length;
  const dealValueMillions = Math.round(deal.financials.enterpriseValue / 1_000_000);

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/deals/${deal.id}`} className="font-semibold text-primary hover:text-accent">
                {deal.target.companyName}
              </Link>
              <Badge variant={statusDisplay.badgeVariant}>{statusDisplay.label}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {deal.target.sector} · ${dealValueMillions}M
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-3 sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Risk Score</p>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={riskScore * 10} className="h-1.5 w-16" indicatorClassName={riskScoreColor(riskScore)} />
              <span className="text-sm font-semibold tabular-nums text-primary">{riskScore.toFixed(1)}</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Documents</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-primary">{deal.documents.length}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active Bids</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-primary">{activeBidCount}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Days Active</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-primary">{daysActive(deal)}d</p>
          </div>
        </div>

        {deal.status === "Draft" && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/deals/${deal.id}`}>
                <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Upload Documents
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/deals/${deal.id}`}>
                <Radio className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Request Bids
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
