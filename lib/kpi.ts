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
