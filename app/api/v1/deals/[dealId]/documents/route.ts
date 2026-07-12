import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import type { Deal, VdrDocument } from "@/lib/types";

interface RouteParams {
  params: { dealId: string };
}

interface StagedDocumentBody {
  fileName: string;
  fileType: VdrDocument["fileType"];
  sizeBytes: number;
}

const VALID_FILE_TYPES: ReadonlyArray<VdrDocument["fileType"]> = ["pdf", "xlsx", "docx"];

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse<{ deal: Deal } | { error: string }>> {
  const body = (await request.json()) as { documents?: Partial<StagedDocumentBody>[] };

  if (!Array.isArray(body.documents) || body.documents.length === 0) {
    return NextResponse.json({ error: "'documents' must be a non-empty array." }, { status: 400 });
  }

  const invalid = body.documents.some(
    (doc) => !doc.fileName?.trim() || !doc.fileType || !VALID_FILE_TYPES.includes(doc.fileType) || typeof doc.sizeBytes !== "number",
  );
  if (invalid) {
    return NextResponse.json({ error: "Each document needs fileName, fileType (pdf/xlsx/docx), and sizeBytes." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const documents: VdrDocument[] = body.documents.map((doc) => ({
    id: randomUUID(),
    fileName: doc.fileName!.trim(),
    fileType: doc.fileType!,
    sizeBytes: doc.sizeBytes!,
    uploadedAt: now,
    status: "Parsed",
  }));

  const updated = await getDealStore().addDocuments(params.dealId, documents);

  if (!updated) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ deal: updated });
}
