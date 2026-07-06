import { getDealStore } from "@/lib/mock-store";
import { computeBrokerPortfolioKpis, computeRecentActivity } from "@/lib/kpi";
import { DealPortfolioBoard } from "@/components/broker/DealPortfolioBoard";

export default async function DealsPipelinePage() {
  const deals = await getDealStore().list();
  const kpis = computeBrokerPortfolioKpis(deals);
  const recentActivity = computeRecentActivity(deals);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <DealPortfolioBoard deals={deals} kpis={kpis} recentActivity={recentActivity} />
    </div>
  );
}
