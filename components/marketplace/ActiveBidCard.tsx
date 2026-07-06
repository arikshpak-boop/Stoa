import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/premium";
import type { MyBidSummary } from "@/lib/kpi";

export function ActiveBidCard({ bid }: { bid: MyBidSummary }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-primary">{bid.dealName}</p>
          <Badge variant={bid.isLeading ? "success" : "warning"}>{bid.isLeading ? "Leading" : "Competitive"}</Badge>
        </div>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Premium</dt>
            <dd className="font-medium tabular-nums text-primary">{formatCurrency(bid.premiumTotal, bid.currency)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Coverage</dt>
            <dd className="font-medium tabular-nums text-primary">{formatCurrency(bid.limitAmount, bid.currency)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Competitors</dt>
            <dd className="font-medium tabular-nums text-primary">{bid.competitorCount}</dd>
          </div>
        </dl>
        <Link
          href={`/marketplace/${bid.dealId}`}
          className="mt-3 block text-center text-sm font-medium text-accent hover:text-accent-hover"
        >
          View Details
        </Link>
      </CardContent>
    </Card>
  );
}
