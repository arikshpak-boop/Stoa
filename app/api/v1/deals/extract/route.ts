import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import { runMockExtraction, type ExtractionRequestPayload } from "@/lib/extraction";
import type { Deal, Sector } from "@/lib/types";

const VALID_SECTORS: readonly Sector[] = [
  "SaaS / Technology",
  "Manufacturing",
  "Healthcare",
  "Financial Services",
  "Consumer & Retail",
  "Energy & Natural Resources",
  "Business Services",
];

interface ExtractRequestBody {
  organizationName: string;
  companyName: string;
  jurisdiction: string;
  sector: string;
  documents: Array<{ fileName: string; fileType: "pdf" | "xlsx" | "docx"; sizeBytes: number }>;
  dealValue?: number;
}

function isValidSector(value: string): value is Sector {
  return (VALID_SECTORS as readonly string[]).includes(value);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mocks the async extraction controller described in the architecture:
 * routes incoming VDR documents to an LLM-based layout extractor and
 * returns a populated, confidence-scored underwriting grid. In production
 * this endpoint would enqueue a background worker job and respond 202,
 * with the worker posting results to a webhook once parsing completes;
 * here we simulate the worker latency inline and return the completed
 * deal synchronously so the demo functions without an external queue.
 */
export async function POST(request: NextRequest): Promise<NextResponse<{ deal: Deal } | { error: string }>> {
  const body = (await request.json()) as Partial<ExtractRequestBody>;

  if (!body.organizationName || !body.companyName || !body.jurisdiction || !body.sector) {
    return NextResponse.json({ error: "organizationName, companyName, jurisdiction, and sector are required." }, { status: 400 });
  }

  if (!isValidSector(body.sector)) {
    return NextResponse.json({ error: `Unsupported sector: ${body.sector}` }, { status: 400 });
  }

  const payload: ExtractionRequestPayload = {
    organizationName: body.organizationName,
    companyName: body.companyName,
    jurisdiction: body.jurisdiction,
    sector: body.sector,
    documents: body.documents ?? [],
    dealValue: typeof body.dealValue === "number" && body.dealValue > 0 ? body.dealValue : undefined,
  };

  await sleep(650);

  const extraction = runMockExtraction(payload);

  const store = getDealStore();
  const deal = store.create({
    organizationName: payload.organizationName,
    target: {
      companyName: payload.companyName,
      jurisdiction: payload.jurisdiction,
      sector: payload.sector,
    },
    financials: {
      enterpriseValue: extraction.enterpriseValue,
      currency: extraction.currency,
      targetDebt: extraction.targetDebt,
      targetCash: extraction.targetCash,
    },
    legal: {
      governingLaw: extraction.governingLaw,
      disputeResolutionVenue: extraction.disputeResolutionVenue,
    },
    timeline: {
      signingDate: extraction.signingDate,
      scheduledClosingDate: extraction.scheduledClosingDate,
    },
    status: "Submitted",
    documents: payload.documents,
    missingDisclosuresByWarranty: extraction.missingDisclosuresByWarranty,
    bids: [],
    fieldConfidence: extraction.fieldConfidence,
  });

  return NextResponse.json({ deal }, { status: 201 });
}
