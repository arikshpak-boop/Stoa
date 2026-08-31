import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { formatCurrency } from "@/lib/premium";
import { Badge } from "@/components/ui/badge";
import { AskForMoreBidsButton } from "@/components/broker/AskForMoreBidsButton";
import { BidComparisonView } from "@/components/broker/BidComparisonView";
import { DEAL_STATUS_DISPLAY } from "@/lib/deal-status-display";

export default async function DealBidsPage({ params }: { params: { dealId: string } }) {
  const deal = await getDealStore().get(params.dealId);

  if (!deal) {
    notFound();
  }

  const statusDisplay = DEAL_STATUS_DISPLAY[deal.status];
  const pendingCount = deal.bids.filter((bid) => bid.bidStatus === "Pending").length;
  const canSolicit = deal.status === "Submitted" || deal.status === "Analyzed";

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <Link
        href={`/deals/${deal.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to deal
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-medium tracking-tight text-primary">Bids Received</h1>
            <Badge variant={statusDisplay.badgeVariant}>{statusDisplay.label}</Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {deal.target.companyName} · {formatCurrency(deal.financials.enterpriseValue, deal.financials.currency)} ·{" "}
            {deal.bids.length} bid{deal.bids.length === 1 ? "" : "s"}, {pendingCount} pending
          </p>
        </div>
        {canSolicit && (
          <div className="w-56">
            <AskForMoreBidsButton dealId={deal.id} />
          </div>
        )}
      </div>

      {deal.distribution && deal.distribution.carrierNames.length > 0 && (
        <p className="mt-4 rounded-lg bg-band-tint px-4 py-3 text-sm text-muted-foreground">
          Presented to {deal.distribution.carrierNames.length} carrier
          {deal.distribution.carrierNames.length === 1 ? "" : "s"};{" "}
          <span className="font-semibold text-primary">{deal.bids.length}</span> have quoted.
        </p>
      )}

      <div className="mt-8">
        <BidComparisonView
          dealId={deal.id}
          companyName={deal.target.companyName}
          currency={deal.financials.currency}
          bids={deal.bids}
          exclusions={deal.exclusions}
        />
      </div>
    </div>
  );
}
