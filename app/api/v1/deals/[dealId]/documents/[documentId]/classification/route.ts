import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import { getServerSession } from "@/lib/get-session";
import type { Deal, DocumentClassification } from "@/lib/types";

interface RouteParams {
  params: { dealId: string; documentId: string };
}

interface PatchBody {
  classification: DocumentClassification;
}

const VALID_CLASSIFICATIONS: ReadonlyArray<DocumentClassification> = [
  "spa-transaction-agreement",
  "financial-statement",
  "disclosure-schedule",
  "org-document",
  "correspondence",
  "unclassifiable-irrelevant",
];

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse<{ deal: Deal } | { error: string }>> {
  const session = getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required to override a document classification." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<PatchBody>;
  if (!body.classification || !VALID_CLASSIFICATIONS.includes(body.classification)) {
    return NextResponse.json({ error: `classification must be one of: ${VALID_CLASSIFICATIONS.join(", ")}.` }, { status: 400 });
  }

  const updated = await getDealStore().overrideDocumentClassification(
    params.dealId,
    params.documentId,
    body.classification,
    session.email,
  );

  if (!updated) {
    return NextResponse.json({ error: `Deal ${params.dealId} or document ${params.documentId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ deal: updated });
}
