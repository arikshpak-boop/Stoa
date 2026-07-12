import Link from "next/link";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/premium";
import { formatDate } from "@/lib/utils";
import { policyEffectiveDate, policyNumber } from "@/lib/policy";
import type { Bid, Deal } from "@/lib/types";

export interface WonDeal {
  deal: Deal;
  bid: Bid;
}

export function WonDealsPanel({ wonDeals }: { wonDeals: WonDeal[] }) {
  if (wonDeals.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-4 w-4 text-accent" aria-hidden="true" />
          Won Deals
        </CardTitle>
        <CardDescription>Bids you've won, now moving toward policy activation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {wonDeals.map(({ deal, bid }) => (
          <div key={bid.id} className="rounded-md border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-primary">{deal.target.companyName}</p>
              <Badge variant="success">Active</Badge>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Premium</dt>
              <dd className="text-right font-medium tabular-nums text-primary">
                {formatCurrency(bid.premiumTotal, deal.financials.currency)}
              </dd>
              <dt className="text-muted-foreground">Coverage</dt>
              <dd className="text-right font-medium tabular-nums text-primary">
                {formatCurrency(bid.limitAmount, deal.financials.currency)}
              </dd>
              <dt className="text-muted-foreground">Policy #</dt>
              <dd className="text-right font-mono text-xs font-medium text-primary">{policyNumber(deal, bid)}</dd>
              <dt className="text-muted-foreground">Effective</dt>
              <dd className="text-right font-medium text-primary">{formatDate(policyEffectiveDate(deal))}</dd>
            </dl>
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <Link href={`/marketplace/${deal.id}/won`}>View Policy Details</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
