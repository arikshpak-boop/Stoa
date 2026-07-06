import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { formatCurrency } from "@/lib/premium";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationSplitView } from "@/components/ingestion/VerificationSplitView";
import { BidsTable } from "@/components/marketplace/BidsTable";

export default async function DealDetailPage({ params }: { params: { dealId: string } }) {
  const deal = await getDealStore().get(params.dealId);

  if (!deal) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-primary">{deal.target.companyName}</h1>
            <Badge>{deal.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {deal.target.jurisdiction} · {deal.target.sector} · {formatCurrency(deal.financials.enterpriseValue, deal.financials.currency)} EV
          </p>
        </div>
        <Button asChild>
          <Link href={`/deals/${deal.id}/risk`}>
            View Risk &amp; Exclusions Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card className="mt-6 border-accent/20 bg-accent/5">
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span className="font-semibold text-primary">Immutable Snapshot</span>
          </div>
          <span className="text-muted-foreground">Version <span className="font-medium text-primary">v{deal.version}</span></span>
          <span className="break-all font-mono text-xs text-muted-foreground">{deal.snapshotHash}</span>
          <span className="text-muted-foreground">Locked {formatDate(deal.createdAt)}</span>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Target Timeline</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p>Signing: <span className="font-medium text-primary">{formatDate(deal.timeline.signingDate)}</span></p>
            <p className="mt-1">Closing: <span className="font-medium text-primary">{formatDate(deal.timeline.scheduledClosingDate)}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Debt / Cash Position</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p>Debt: <span className="font-medium text-primary">{formatCurrency(deal.financials.targetDebt, deal.financials.currency)}</span></p>
            <p className="mt-1">Cash: <span className="font-medium text-primary">{formatCurrency(deal.financials.targetCash, deal.financials.currency)}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Governing Law</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p>Law: <span className="font-medium text-primary">{deal.legal.governingLaw}</span></p>
            <p className="mt-1">Venue: <span className="font-medium text-primary">{deal.legal.disputeResolutionVenue}</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-primary">Bids Received</h2>
          <span className="text-sm text-muted-foreground">{deal.bids.length} carrier{deal.bids.length === 1 ? "" : "s"} bidding</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Competitive bids from carriers reviewing this submission — visible here as soon as they're placed.
        </p>
        <div className="mt-4">
          <BidsTable bids={deal.bids} currency={deal.financials.currency} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight text-primary">Verification Workspace</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm each extracted field against its source attribution before the submission is routed to carriers.
        </p>
        <div className="mt-4">
          <VerificationSplitView deal={deal} />
        </div>
      </div>
    </div>
  );
}
