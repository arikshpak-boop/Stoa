import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import type { Deal } from "@/lib/types";

interface RouteParams {
  params: { dealId: string };
}

interface BidRequestResponse {
  deal: Deal;
  /** Carriers on the distribution list that have not yet bid. */
  notified: string[];
  /**
   * Size of the distribution list, or null when the deal was published to the
   * whole panel. The caller needs this to tell "everyone already quoted" apart
   * from "there was never a list", which are very different messages.
   */
  distributionSize: number | null;
}

/**
 * Re-solicits the panel for bids on an already-published deal.
 *
 * Carriers that have already quoted are excluded — the point is to chase the
 * ones still silent, not to spam the whole panel. On a deal with no explicit
 * distribution the whole panel is addressable, so `notified` comes back empty
 * and the UI says so rather than implying a targeted nudge went out.
 */
export async function POST(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<BidRequestResponse | { error: string }>> {
  const store = getDealStore();
  const deal = await store.get(params.dealId);

  if (!deal) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  if (deal.status === "Draft") {
    return NextResponse.json(
      { error: "Publish the deal to the marketplace before requesting more bids." },
      { status: 409 },
    );
  }

  if (deal.status === "Closed") {
    return NextResponse.json({ error: "This deal is closed and no longer accepting bids." }, { status: 409 });
  }

  const alreadyBid = new Set(deal.bids.map((bid) => bid.carrierName.toLowerCase()));
  const distributionNames = deal.distribution?.carrierNames ?? null;
  const notified = (distributionNames ?? []).filter((name) => !alreadyBid.has(name.toLowerCase()));

  const updated = await store.recordBidRequest(deal.id);

  if (!updated) {
    return NextResponse.json({ error: "Failed to record the bid request." }, { status: 500 });
  }

  return NextResponse.json({ deal: updated, notified, distributionSize: distributionNames?.length ?? null });
}
