import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DealWarranty } from "@/lib/types";

export function DealHealthSummary({ warranties }: { warranties: DealWarranty[] }) {
  const total = warranties.length || 1;
  const lowCount = warranties.filter((w) => w.riskLevel === "Low").length;
  const mediumCount = warranties.filter((w) => w.riskLevel === "Medium").length;
  const highCount = warranties.filter((w) => w.riskLevel === "High").length;

  const pct = (count: number) => Math.round((count / total) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />
          Deal Health Summary
        </CardTitle>
        <CardDescription>AI-powered underwriting analysis</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-success/30 bg-success/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">Low Risk</span>
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
          </div>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">{pct(lowCount)}%</p>
          <p className="text-xs text-muted-foreground">{lowCount} warranties cleared</p>
        </div>
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">Medium Risk</span>
            <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
          </div>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">{pct(mediumCount)}%</p>
          <p className="text-xs text-muted-foreground">{mediumCount} warranties flagged</p>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">High Risk</span>
            <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
          </div>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">{pct(highCount)}%</p>
          <p className="text-xs text-muted-foreground">{highCount} require review</p>
        </div>
      </CardContent>
    </Card>
  );
}
