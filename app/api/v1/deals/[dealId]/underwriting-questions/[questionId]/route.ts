import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import type { Deal } from "@/lib/types";

interface RouteParams {
  params: { dealId: string; questionId: string };
}

interface AnswerRequestBody {
  answer: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<{ deal: Deal } | { error: string }>> {
  const body = (await request.json()) as Partial<AnswerRequestBody>;

  if (!body.answer?.trim()) {
    return NextResponse.json({ error: "'answer' is required." }, { status: 400 });
  }

  const updated = await getDealStore().answerUnderwritingQuestion(params.dealId, params.questionId, body.answer.trim());

  if (!updated) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ deal: updated });
}
