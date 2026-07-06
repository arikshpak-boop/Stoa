import Link from "next/link";
import { FileBarChart, PlusCircle, Send, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  href?: string;
  icon: typeof PlusCircle;
  comingSoon?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Create New Deal", href: "/deals/new", icon: PlusCircle },
  { label: "Bulk Upload Documents", href: "/deals/new", icon: Upload },
  { label: "Invite Carriers", icon: Send, comingSoon: true },
  { label: "Generate Report", href: "/deals", icon: FileBarChart },
];

export function QuickActionsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const content = (
            <>
              <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>{action.label}</span>
              {action.comingSoon && <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">Soon</span>}
            </>
          );

          if (!action.href) {
            return (
              <div
                key={action.label}
                className="flex cursor-not-allowed items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground/70"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-accent/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {content}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
