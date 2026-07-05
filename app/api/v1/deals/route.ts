import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import type { Deal } from "@/lib/types";

export async function GET(request: NextRequest): Promise<NextResponse<{ deals: Deal[] }>> {
  const store = getDealStore();
  const statusFilter = request.nextUrl.searchParams.get("status");
  const sectorFilter = request.nextUrl.searchParams.get("sector");

  let deals = store.list();

  if (statusFilter) {
    deals = deals.filter((deal) => deal.status === statusFilter);
  }

  if (sectorFilter) {
    deals = deals.filter((deal) => deal.target.sector === sectorFilter);
  }

  return NextResponse.json({ deals });
}
