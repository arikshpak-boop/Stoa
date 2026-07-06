import { DollarSign, FileText, TrendingUp, Zap } from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { getServerSession } from "@/lib/get-session";
import { computeCarrierKpis, summarizeMyActiveBids } from "@/lib/kpi";
import { formatCurrency } from "@/lib/premium";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { OpportunityList } from "@/components/marketplace/OpportunityList";
import { ActiveBidCard } from "@/components/marketplace/ActiveBidCard";

export default async function CarrierMarketplacePage() {
  const allDeals = await getDealStore().list();
  const session = getServerSession();
  const organizationName = session?.organizationName ?? "";
  const deals = allDeals.filter((deal) => deal.status === "Submitted" || deal.status === "Analyzed" || deal.status === "Closed");
  const kpis = computeCarrierKpis(allDeals, organizationName);
  const myActiveBids = summarizeMyActiveBids(allDeals, organizationName);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Carrier Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review opportunities and manage bids.</p>
        </div>
        <Badge variant="primary">{kpis.myActiveBids} Active Bids</Badge>
      </div>

      <div className="mt-6">
        <KpiRow>
          <KpiCard
            label="Active Bids"
            value={String(kpis.myActiveBids)}
            sublabel={`of ${kpis.opportunitiesInMarket} opportunities`}
            icon={Zap}
          />
          <KpiCard
            label="Total Exposure"
            value={formatCurrency(kpis.myTotalExposure, "USD")}
            sublabel="across active bids"
            icon={FileText}
          />
          <KpiCard
            label="Win Rate"
            value={kpis.myWinRatePercent !== null ? `${kpis.myWinRatePercent}%` : "—"}
            sublabel={`${kpis.myDecidedBidCount} decided bids`}
            icon={TrendingUp}
            tone={kpis.myWinRatePercent !== null && kpis.myWinRatePercent >= 40 ? "success" : "default"}
          />
          <KpiCard
            label="Avg Premium"
            value={kpis.myAveragePremium !== null ? formatCurrency(kpis.myAveragePremium, "USD") : "—"}
            sublabel="across all bids placed"
            icon={DollarSign}
          />
        </KpiRow>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OpportunityList deals={deals} />
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-primary">Your Active Bids</h2>
          <p className="text-sm text-muted-foreground">Pending bids you've placed, ranked against competitors.</p>
          <div className="mt-3 space-y-3">
            {myActiveBids.map((bid) => (
              <ActiveBidCard key={bid.bidId} bid={bid} />
            ))}
            {myActiveBids.length === 0 && (
              <div className="rounded-lg border border-border bg-white py-8 text-center text-sm text-muted-foreground">
                No active bids yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
