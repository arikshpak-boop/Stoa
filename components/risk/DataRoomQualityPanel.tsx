import { Gauge, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DDQualityAssessment, DDTier } from "@/lib/dd-quality";

const TIER_VARIANT: Record<DDTier, "success" | "primary" | "warning" | "destructive"> = {
  Excellent: "success",
  Standard: "primary",
  Weak: "warning",
  Poor: "destructive",
};

const TIER_ICON: Record<DDTier, typeof ShieldCheck> = {
  Excellent: ShieldCheck,
  Standard: ShieldCheck,
  Weak: ShieldAlert,
  Poor: ShieldAlert,
};

const SCORE_COLOR = (score: number): string => {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-accent";
  if (score >= 40) return "bg-warning";
  return "bg-destructive";
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-primary">{score} / 100</span>
      </div>
      <Progress
        value={score}
        aria-label={`${label} score: ${score} out of 100`}
        className="mt-1.5"
        indicatorClassName={SCORE_COLOR(score)}
      />
    </div>
  );
}

export function DataRoomQualityPanel({ assessment }: { assessment: DDQualityAssessment }) {
  const TierIcon = TIER_ICON[assessment.tier];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-accent" aria-hidden="true" />
            Data Room Quality Report
          </CardTitle>
          <CardDescription>Automated assessment of the transaction data room.</CardDescription>
        </div>
        <Badge variant={TIER_VARIANT[assessment.tier]} className="flex items-center gap-1">
          <TierIcon className="h-3 w-3" aria-hidden="true" />
          {assessment.tier}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ScoreBar label="Structure" score={assessment.structureScore} />
          <ScoreBar label="Quality" score={assessment.qualityScore} />
          <ScoreBar label="Clarity" score={assessment.clarityScore} />
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-md border border-border bg-muted/60 p-4 tabular-nums">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Overall Score</p>
            <p className="text-lg font-semibold text-primary">{assessment.compositeScore} / 100</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Recommended Rate on Line</p>
            <p className="text-lg font-semibold text-primary">
              {assessment.recommendedRateOnLinePercent !== null
                ? `${assessment.recommendedRateOnLinePercent.toFixed(2)}%`
                : "Decline"}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{assessment.recommendedAction}</p>
      </CardContent>
    </Card>
  );
}
