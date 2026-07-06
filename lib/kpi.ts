import type { Deal } from "./types";

export interface BrokerKpis {
  activeDeals: number;
  totalBidsReceived: number;
  dealsClosed: number;
  averageDataRoomQuality: number;
}

export function computeBrokerKpis(deals: Deal[]): BrokerKpis {
  const activeDeals = deals.filter((deal) => deal.status !== "Closed").length;
  const totalBidsReceived = deals.reduce((total, deal) => total + deal.bids.length, 0);
  const dealsClosed = deals.filter((deal) => deal.status === "Closed").length;
  const averageDataRoomQuality =
    deals.length === 0 ? 0 : deals.reduce((total, deal) => total + deal.ddQuality.compositeScore, 0) / deals.length;

  return { activeDeals, totalBidsReceived, dealsClosed, averageDataRoomQuality };
}

export interface BrokerPortfolioKpis {
  totalDealValue: number;
  activeDeals: number;
  totalBids: number;
  averageDaysToClose: number | null;
}

export function computeBrokerPortfolioKpis(deals: Deal[]): BrokerPortfolioKpis {
  const activeDealsList = deals.filter((deal) => deal.status !== "Closed");
  const totalDealValue = activeDealsList.reduce((total, deal) => total + deal.financials.enterpriseValue, 0);
  const totalBids = deals.reduce((total, deal) => total + deal.bids.length, 0);

  const closingDurationsInDays = deals.map((deal) => {
    const signing = new Date(deal.timeline.signingDate).getTime();
    const closing = new Date(deal.timeline.scheduledClosingDate).getTime();
    return (closing - signing) / (1000 * 60 * 60 * 24);
  });
  const averageDaysToClose =
    closingDurationsInDays.length === 0
      ? null
      : Math.round(closingDurationsInDays.reduce((total, days) => total + days, 0) / closingDurationsInDays.length);

  return { totalDealValue, activeDeals: activeDealsList.length, totalBids, averageDaysToClose };
}

export function averageRiskScoreOutOfTen(deal: Deal): number {
  const average = deal.warranties.reduce((total, w) => total + w.severityScore, 0) / deal.warranties.length;
  return Math.round((average / 10) * 10) / 10;
}

export function daysActive(deal: Deal): number {
  return Math.max(0, Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
}

export interface RecentActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
}

/**
 * Derived only from events we can genuinely timestamp -- bid submissions
 * and deal creation. The reference design shows a richer variety (document
 * uploads, risk-assessment completion, deadline changes) but we don't track
 * distinct timestamps for those in the mock model, so fabricating them
 * would be dishonest. Real data, smaller variety, beats fake data.
 */
export function computeRecentActivity(deals: Deal[], limit = 5): RecentActivityItem[] {
  const items: RecentActivityItem[] = [];

  for (const deal of deals) {
    items.push({
      id: `deal-${deal.id}`,
      title: "Deal submitted",
      subtitle: `${deal.target.companyName} · ${deal.organizationName}`,
      timestamp: deal.createdAt,
    });
    for (const bid of deal.bids) {
      items.push({
        id: `bid-${bid.id}`,
        title: "New bid received",
        subtitle: `${deal.target.companyName} · ${bid.carrierName}`,
        timestamp: bid.submittedAt,
      });
    }
  }

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}

export interface CarrierKpis {
  opportunitiesInMarket: number;
  myActiveBids: number;
  myWinRatePercent: number | null;
  myDealsWon: number;
  myTotalExposure: number;
  myAveragePremium: number | null;
  myDecidedBidCount: number;
}

export function computeCarrierKpis(deals: Deal[], organizationName: string): CarrierKpis {
  const opportunitiesInMarket = deals.filter((deal) => deal.status === "Submitted" || deal.status === "Analyzed").length;

  const myBids = deals.flatMap((deal) => deal.bids).filter((bid) => bid.carrierName === organizationName);
  const myActiveBidsList = myBids.filter((bid) => bid.bidStatus === "Pending");
  const myActiveBids = myActiveBidsList.length;
  const myDealsWon = myBids.filter((bid) => bid.bidStatus === "Accepted").length;
  const myDecidedBids = myBids.filter((bid) => bid.bidStatus === "Accepted" || bid.bidStatus === "Declined");
  const myWinRatePercent = myDecidedBids.length === 0 ? null : Math.round((myDealsWon / myDecidedBids.length) * 100);

  const myTotalExposure = myActiveBidsList.reduce((total, bid) => total + bid.limitAmount, 0);
  const myAveragePremium =
    myBids.length === 0 ? null : Math.round(myBids.reduce((total, bid) => total + bid.premiumTotal, 0) / myBids.length);

  return {
    opportunitiesInMarket,
    myActiveBids,
    myWinRatePercent,
    myDealsWon,
    myTotalExposure,
    myAveragePremium,
    myDecidedBidCount: myDecidedBids.length,
  };
}

export interface OpportunitySummary {
  clearedCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  lowestBidPremium: number | null;
  daysUntilSigning: number;
}

export function summarizeOpportunity(deal: Deal): OpportunitySummary {
  const clearedCount = deal.warranties.filter((w) => w.flagStatus === "Clear").length;
  const mediumRiskCount = deal.warranties.filter((w) => w.riskLevel === "Medium").length;
  const highRiskCount = deal.warranties.filter((w) => w.riskLevel === "High").length;
  const lowestBidPremium = deal.bids.length === 0 ? null : Math.min(...deal.bids.map((bid) => bid.premiumTotal));
  const daysUntilSigning = Math.ceil((new Date(deal.timeline.signingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return { clearedCount, mediumRiskCount, highRiskCount, lowestBidPremium, daysUntilSigning };
}

export interface MyBidSummary {
  bidId: string;
  dealId: string;
  dealName: string;
  premiumTotal: number;
  limitAmount: number;
  currency: string;
  competitorCount: number;
  isLeading: boolean;
}

export function summarizeMyActiveBids(deals: Deal[], organizationName: string): MyBidSummary[] {
  const summaries: MyBidSummary[] = [];

  for (const deal of deals) {
    const myBid = deal.bids.find((bid) => bid.carrierName === organizationName && bid.bidStatus === "Pending");
    if (!myBid) continue;

    const otherPendingBids = deal.bids.filter((bid) => bid.id !== myBid.id && bid.bidStatus === "Pending");
    const isLeading = otherPendingBids.every((bid) => bid.premiumTotal >= myBid.premiumTotal);

    summaries.push({
      bidId: myBid.id,
      dealId: deal.id,
      dealName: deal.target.companyName,
      premiumTotal: myBid.premiumTotal,
      limitAmount: myBid.limitAmount,
      currency: deal.financials.currency,
      competitorCount: otherPendingBids.length,
      isLeading,
    });
  }

  return summaries;
}
