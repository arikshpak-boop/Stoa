import { CheckCircle2, FileText, Gauge, TrendingUp } from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { getServerSession } from "@/lib/get-session";
import { computeCarrierKpis } from "@/lib/kpi";
import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { CarrierDashboardTable } from "@/components/marketplace/CarrierDashboardTable";

export default async function CarrierMarketplacePage() {
  const allDeals = await getDealStore().list();
  const session = getServerSession();
  const deals = allDeals.filter((deal) => deal.status === "Submitted" || deal.status === "Analyzed" || deal.status === "Closed");
  const kpis = computeCarrierKpis(allDeals, session?.organizationName ?? "");

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">Deal Marketplace</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Filtered transaction streams across value, sector, and risk appetite. Every risk report is a locked snapshot
        — the underlying submission cannot change without a new version.
      </p>

      <div className="mt-6">
        <KpiRow>
          <KpiCard label="Opportunities in Market" value={String(kpis.opportunitiesInMarket)} icon={Gauge} />
          <KpiCard label="My Active Bids" value={String(kpis.myActiveBids)} icon={FileText} />
          <KpiCard
            label="My Win Rate"
            value={kpis.myWinRatePercent !== null ? `${kpis.myWinRatePercent}%` : "—"}
            icon={TrendingUp}
            tone={kpis.myWinRatePercent !== null && kpis.myWinRatePercent >= 40 ? "success" : "default"}
          />
          <KpiCard label="My Deals Won" value={String(kpis.myDealsWon)} icon={CheckCircle2} tone="success" />
        </KpiRow>
      </div>

      <div className="mt-6">
        <CarrierDashboardTable deals={deals} />
      </div>
    </div>
  );
}
