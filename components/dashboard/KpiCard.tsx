import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive";
}

const TONE_ICON_CLASS: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "text-accent bg-accent/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
};

export function KpiCard({ label, value, sublabel, icon: Icon, tone = "default" }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", TONE_ICON_CLASS[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-semibold tracking-tight tabular-nums text-primary">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sublabel && <p className="text-[11px] text-muted-foreground/80">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{children}</div>;
}
