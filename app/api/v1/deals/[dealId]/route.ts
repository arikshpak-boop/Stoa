import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import type { Deal } from "@/lib/types";

interface RouteParams {
  params: { dealId: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse<{ deal: Deal } | { error: string }>> {
  const store = getDealStore();
  const deal = await store.get(params.dealId);

  if (!deal) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ deal });
}

const VALID_STATUSES: ReadonlyArray<Deal["status"]> = ["Draft", "Submitted", "Analyzed", "Closed"];

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse<{ deal: Deal } | { error: string }>> {
  const body = (await request.json()) as { status?: Deal["status"] };

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: `'status' must be one of: ${VALID_STATUSES.join(", ")}.` }, { status: 400 });
  }

  const updated = await getDealStore().updateDealStatus(params.dealId, body.status);

  if (!updated) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ deal: updated });
}
