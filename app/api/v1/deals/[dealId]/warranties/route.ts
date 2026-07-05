import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import type { DealWarranty, ExclusionClause } from "@/lib/types";

interface RouteParams {
  params: { dealId: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<{ warranties: DealWarranty[]; exclusions: ExclusionClause[] } | { error: string }>> {
  const store = getDealStore();
  const deal = store.get(params.dealId);

  if (!deal) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ warranties: deal.warranties, exclusions: deal.exclusions });
}
