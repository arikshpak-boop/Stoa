import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { getServerSession } from "@/lib/get-session";
import { formatCurrency } from "@/lib/premium";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnderwritingGrid } from "@/components/risk/UnderwritingGrid";
import { DataRoomQualityPanel } from "@/components/risk/DataRoomQualityPanel";
import { BidForm } from "@/components/marketplace/BidForm";
import { BidsTable } from "@/components/marketplace/BidsTable";

export default async function CarrierDealWorkspacePage({ params }: { params: { dealId: string } }) {
  const deal = await getDealStore().get(params.dealId);
  const session = getServerSession();

  if (!deal || !session) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/marketplace">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Marketplace
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">{deal.target.companyName}</h1>
        <Badge>{deal.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {deal.target.jurisdiction} · {deal.target.sector} · {formatCurrency(deal.financials.enterpriseValue, deal.financials.currency)} EV
      </p>

      <Card className="mt-6 border-accent/20 bg-accent/5">
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span className="font-semibold text-primary">Un-mutated Submission Package</span>
          </div>
          <span className="text-muted-foreground">Version <span className="font-medium text-primary">v{deal.version}</span></span>
          <span className="break-all font-mono text-xs text-muted-foreground">{deal.snapshotHash}</span>
          <span className="text-muted-foreground">
            Signing {formatDate(deal.timeline.signingDate)} → Closing {formatDate(deal.timeline.scheduledClosingDate)}
          </span>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div id="risk-report" className="scroll-mt-6">
            <DataRoomQualityPanel assessment={deal.ddQuality} />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-primary">Stoa Risk &amp; Exclusions Report</h2>
            <p className="mt-1 text-sm text-muted-foreground">Automated underwriting matrix generated from the locked submission.</p>
            <div className="mt-4">
              <UnderwritingGrid warranties={deal.warranties} exclusions={deal.exclusions} />
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold tracking-tight text-primary">Specific Exclusions</h3>
            <div className="mt-3 space-y-3">
              {deal.exclusions.length === 0 && (
                <p className="text-sm text-muted-foreground">No exclusions triggered on this submission.</p>
              )}
              {deal.exclusions.map((exclusion) => (
                <Card key={exclusion.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm">{exclusion.title}</CardTitle>
                    <Badge variant="outline" className="font-mono">{exclusion.warrantyIdentifier}</Badge>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">{exclusion.draftText}</CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold tracking-tight text-primary">Bids on This Deal</h3>
            <div className="mt-3">
              <BidsTable bids={deal.bids} currency={deal.financials.currency} />
            </div>
          </div>
        </div>

        <div id="configure-bid" className="scroll-mt-6">
          <BidForm
            dealId={deal.id}
            enterpriseValue={deal.financials.enterpriseValue}
            currency={deal.financials.currency}
            carrierName={session.organizationName}
            suggestedRateOnLinePercent={deal.ddQuality.recommendedRateOnLinePercent ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
