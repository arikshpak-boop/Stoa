import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import { calculateLimitPercentOfEv, calculatePremium } from "@/lib/premium";
import type { Bid } from "@/lib/types";

interface RouteParams {
  params: { dealId: string };
}

interface BidRequestBody {
  carrierName: string;
  limitAmount: number;
  retentionAmount: number;
  retentionTrigger: "Tipping" | "Erosion";
  rateOnLinePercent: number;
  underwritingFees: number;
  expenseCap: number;
  policyExpiration: string;
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse<{ bids: Bid[] } | { error: string }>> {
  const store = getDealStore();
  const deal = store.get(params.dealId);

  if (!deal) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ bids: deal.bids });
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse<{ bid: Bid } | { error: string }>> {
  const store = getDealStore();
  const deal = store.get(params.dealId);

  if (!deal) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  const body = (await request.json()) as Partial<BidRequestBody>;

  if (
    !body.carrierName ||
    typeof body.limitAmount !== "number" ||
    typeof body.retentionAmount !== "number" ||
    !body.retentionTrigger ||
    typeof body.rateOnLinePercent !== "number" ||
    typeof body.underwritingFees !== "number" ||
    typeof body.expenseCap !== "number" ||
    !body.policyExpiration
  ) {
    return NextResponse.json({ error: "Missing or invalid bid parameters." }, { status: 400 });
  }

  const calculation = calculatePremium({
    limitAmount: body.limitAmount,
    rateOnLinePercent: body.rateOnLinePercent,
    underwritingFees: body.underwritingFees,
  });

  const bid: Bid = {
    id: randomUUID(),
    dealId: deal.id,
    carrierId: randomUUID(),
    carrierName: body.carrierName,
    limitAmount: body.limitAmount,
    limitPercentOfEv: calculateLimitPercentOfEv(body.limitAmount, deal.financials.enterpriseValue),
    retentionAmount: body.retentionAmount,
    retentionTrigger: body.retentionTrigger,
    rateOnLinePercent: body.rateOnLinePercent,
    premiumTotal: calculation.grossPremium,
    underwritingFees: body.underwritingFees,
    expenseCap: body.expenseCap,
    policyExpiration: body.policyExpiration,
    bidStatus: "Pending",
    submittedAt: new Date().toISOString(),
  };

  const updatedDeal = store.addBid(deal.id, bid);

  if (!updatedDeal) {
    return NextResponse.json({ error: "Failed to persist bid." }, { status: 500 });
  }

  return NextResponse.json({ bid }, { status: 201 });
}
