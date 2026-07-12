"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleQuestion, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import type { UnderwritingOpenQuestion } from "@/lib/types";

interface OpenQuestionsPanelProps {
  dealId: string;
  questions: UnderwritingOpenQuestion[];
  /** carrier = ask new questions; broker = answer pending ones. */
  mode: "carrier" | "broker";
  /** Required in carrier mode: attributed as the asker. */
  carrierName?: string;
}

export function OpenQuestionsPanel({ dealId, questions, mode, carrierName }: OpenQuestionsPanelProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submitQuestion() {
    if (!draft.trim() || !carrierName) return;
    setBusy(true);
    try {
      await fetch(`/api/v1/deals/${dealId}/underwriting-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: draft.trim(), askedBy: carrierName }),
      });
      setDraft("");
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(questionId: string) {
    const answer = answerDrafts[questionId]?.trim();
    if (!answer) return;
    setBusy(true);
    try {
      await fetch(`/api/v1/deals/${dealId}/underwriting-questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      setAnswerDrafts((drafts) => ({ ...drafts, [questionId]: "" }));
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  const pendingCount = questions.filter((q) => q.answer === null).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircleQuestion className="h-4 w-4 text-accent" aria-hidden="true" />
          Open Questions to the Deal Maker
        </CardTitle>
        <CardDescription>
          {mode === "carrier"
            ? "Anything the briefing couldn't verify — the deal maker confirms with the insured and replies on-platform. Answers are appended to the risk report."
            : `Questions carriers need verified with your insured before they can price the risk.${pendingCount > 0 ? ` ${pendingCount} awaiting your answer.` : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 && (
          <p className="rounded-md border border-border bg-muted/40 py-6 text-center text-sm text-muted-foreground">
            No open questions on this deal yet.
          </p>
        )}

        {questions.map((q) => (
          <div key={q.id} className="rounded-md border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-medium text-primary">{q.question}</p>
              <Badge variant={q.answer === null ? "warning" : "success"}>
                {q.answer === null ? "Awaiting Deal Maker" : "Answered"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Asked by {q.askedBy} · {formatDate(q.askedAt)}
            </p>

            {q.answer !== null && (
              <div className="mt-3 rounded-md bg-success/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-success">Deal Maker Response</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{q.answer}</p>
                {q.answeredAt && <p className="mt-1 text-xs text-muted-foreground/80">Answered {formatDate(q.answeredAt)}</p>}
              </div>
            )}

            {q.answer === null && mode === "broker" && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Confirm with your insured, then reply here — the answer is appended to the risk report all carriers see."
                  value={answerDrafts[q.id] ?? ""}
                  onChange={(event) => setAnswerDrafts((drafts) => ({ ...drafts, [q.id]: event.target.value }))}
                  rows={3}
                />
                <Button size="sm" disabled={busy || !(answerDrafts[q.id] ?? "").trim()} onClick={() => submitAnswer(q.id)}>
                  <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Send Answer
                </Button>
              </div>
            )}
          </div>
        ))}

        {mode === "carrier" && (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium text-primary">Ask a new question</p>
            <Textarea
              placeholder="e.g. Please confirm whether the pending litigation disclosed in Schedule 4.9 has been reserved against in the FY25 accounts."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
            />
            <Button size="sm" disabled={busy || !draft.trim()} onClick={submitQuestion}>
              <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Submit to Deal Maker
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
