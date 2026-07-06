import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime, type RecentActivityItem } from "@/lib/kpi";

export function RecentActivityPanel({ items }: { items: RecentActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-2.5 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <div>
                <p className="font-medium text-primary">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
