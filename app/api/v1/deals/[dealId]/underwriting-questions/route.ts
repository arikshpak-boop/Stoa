import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDealStore } from "@/lib/mock-store";
import type { UnderwritingOpenQuestion } from "@/lib/types";

interface RouteParams {
  params: { dealId: string };
}

interface QuestionRequestBody {
  question: string;
  askedBy: string;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<{ question: UnderwritingOpenQuestion } | { error: string }>> {
  const body = (await request.json()) as Partial<QuestionRequestBody>;

  if (!body.question?.trim() || !body.askedBy?.trim()) {
    return NextResponse.json({ error: "Both 'question' and 'askedBy' are required." }, { status: 400 });
  }

  const question: UnderwritingOpenQuestion = {
    id: randomUUID(),
    dealId: params.dealId,
    question: body.question.trim(),
    askedBy: body.askedBy.trim(),
    askedAt: new Date().toISOString(),
    answer: null,
    answeredAt: null,
  };

  const updated = await getDealStore().addUnderwritingQuestion(params.dealId, question);

  if (!updated) {
    return NextResponse.json({ error: `Deal ${params.dealId} not found.` }, { status: 404 });
  }

  return NextResponse.json({ question }, { status: 201 });
}
