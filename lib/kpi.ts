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
}

export function computeCarrierKpis(deals: Deal[], organizationName: string): CarrierKpis {
  const opportunitiesInMarket = deals.filter((deal) => deal.status === "Submitted" || deal.status === "Analyzed").length;

  const myBids = deals.flatMap((deal) => deal.bids).filter((bid) => bid.carrierName === organizationName);
  const myActiveBids = myBids.filter((bid) => bid.bidStatus === "Pending").length;
  const myDealsWon = myBids.filter((bid) => bid.bidStatus === "Accepted").length;
  const myDecidedBids = myBids.filter((bid) => bid.bidStatus === "Accepted" || bid.bidStatus === "Declined");
  const myWinRatePercent = myDecidedBids.length === 0 ? null : Math.round((myDealsWon / myDecidedBids.length) * 100);

  return { opportunitiesInMarket, myActiveBids, myWinRatePercent, myDealsWon };
}
