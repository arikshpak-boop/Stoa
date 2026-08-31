import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import { calculateLimitPercentOfEv, calculatePremium } from "@/lib/premium";
import { WARRANTY_DEFINITIONS, type Bid, type CustomExclusion, type WarrantyIdentifier } from "@/lib/types";
import { isLibraryExclusionId } from "@/lib/exclusion-library";
import { canCarrierSeeDeal } from "@/lib/carriers";
import { getServerSession } from "@/lib/get-session";

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
  requestedExclusions?: WarrantyIdentifier[];
  libraryExclusions?: string[];
  customExclusions?: CustomExclusion[];
  carrierContactEmail?: string;
}

const MAX_CUSTOM_EXCLUSIONS = 25;
const MAX_CUSTOM_TITLE = 160;
const MAX_CUSTOM_WORDING = 4000;

const VALID_WARRANTY_IDS = new Set<string>(WARRANTY_DEFINITIONS.map((definition) => definition.identifier));

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse<{ bids: Bid[] } | { error: string }>> {
  const store = getDealStore();
  const deal = await store.get(params.dealId);

  if (!deal) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ bids: deal.bids });
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse<{ bid: Bid } | { error: string }>> {
  const store = getDealStore();
  const deal = await store.get(params.dealId);

  if (!deal) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  const session = getServerSession();

  // A carrier that cannot see the deal cannot bid on it. Without this the
  // distribution list would be a UI convention rather than a rule.
  if (
    session?.role === "Carrier" &&
    !canCarrierSeeDeal(deal.distribution?.carrierNames, session.organizationName)
  ) {
    return NextResponse.json({ error: "This deal was not distributed to your organisation." }, { status: 403 });
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

  const requestedExclusions = body.requestedExclusions ?? [];

  if (!Array.isArray(requestedExclusions) || requestedExclusions.some((id) => !VALID_WARRANTY_IDS.has(id))) {
    return NextResponse.json({ error: "requestedExclusions must reference known warranties." }, { status: 400 });
  }

  const libraryExclusions = body.libraryExclusions ?? [];

  if (!Array.isArray(libraryExclusions) || libraryExclusions.some((id) => typeof id !== "string" || !isLibraryExclusionId(id))) {
    return NextResponse.json({ error: "libraryExclusions must reference the standard exclusion library." }, { status: 400 });
  }

  const customExclusions = body.customExclusions ?? [];

  if (!Array.isArray(customExclusions) || customExclusions.length > MAX_CUSTOM_EXCLUSIONS) {
    return NextResponse.json(
      { error: `customExclusions must be a list of at most ${MAX_CUSTOM_EXCLUSIONS} entries.` },
      { status: 400 },
    );
  }

  const malformedCustom = customExclusions.some(
    (exclusion) =>
      typeof exclusion?.title !== "string" ||
      typeof exclusion?.wording !== "string" ||
      exclusion.title.trim().length === 0 ||
      exclusion.wording.trim().length === 0 ||
      exclusion.title.length > MAX_CUSTOM_TITLE ||
      exclusion.wording.length > MAX_CUSTOM_WORDING,
  );

  if (malformedCustom) {
    return NextResponse.json(
      { error: "Each custom exclusion needs a title and policy wording within the length limits." },
      { status: 400 },
    );
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
    requestedExclusions,
    libraryExclusions,
    customExclusions: customExclusions.map((exclusion) => ({
      title: exclusion.title.trim(),
      wording: exclusion.wording.trim(),
    })),
    carrierContactEmail: body.carrierContactEmail,
  };

  const updatedDeal = await store.addBid(deal.id, bid);

  if (!updatedDeal) {
    return NextResponse.json({ error: "Failed to persist bid." }, { status: 500 });
  }

  return NextResponse.json({ bid }, { status: 201 });
}
