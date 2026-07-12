import { ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { UnderwritingOpenQuestion } from "@/lib/types";

/**
 * The Level-2 comfort layer on the risk report: deal-maker-verified answers
 * to carrier questions. Renders nothing until at least one is answered.
 */
export function ClarificationsPanel({ questions }: { questions: UnderwritingOpenQuestion[] }) {
  const answered = questions.filter((q) => q.answer !== null);
  if (answered.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldQuestion className="h-4 w-4 text-accent" aria-hidden="true" />
          Underwriting Call Clarifications
        </CardTitle>
        <CardDescription>
          Deal-maker-verified answers from the underwriting call, appended to this risk report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-border">
        {answered.map((q) => (
          <div key={q.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-medium text-primary">{q.question}</p>
              <Badge variant="success">Verified</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Asked by {q.askedBy} · answered {q.answeredAt ? formatDate(q.answeredAt) : "—"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{q.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
