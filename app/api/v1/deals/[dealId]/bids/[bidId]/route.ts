import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import type { Deal } from "@/lib/types";

interface RouteParams {
  params: { dealId: string; bidId: string };
}

interface PatchBody {
  bidStatus: "Accepted" | "Declined";
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse<{ deal: Deal } | { error: string }>> {
  const store = getDealStore();
  const body = (await request.json()) as Partial<PatchBody>;

  if (body.bidStatus !== "Accepted" && body.bidStatus !== "Declined") {
    return NextResponse.json({ error: "bidStatus must be 'Accepted' or 'Declined'." }, { status: 400 });
  }

  const updated =
    body.bidStatus === "Accepted"
      ? await store.acceptBid(params.dealId, params.bidId)
      : await store.updateBidStatus(params.dealId, params.bidId, "Declined");

  if (!updated) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ deal: updated });
}
