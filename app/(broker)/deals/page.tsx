import Link from "next/link";
import { Briefcase, CheckCircle2, Gauge, PlusCircle, Users } from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { computeBrokerKpis } from "@/lib/kpi";
import { formatCurrency } from "@/lib/premium";
import { formatDate, truncateHash } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { Deal } from "@/lib/types";

const STATUS_VARIANT: Record<Deal["status"], "muted" | "default" | "success" | "primary"> = {
  Draft: "muted",
  Submitted: "default",
  Analyzed: "primary",
  Closed: "success",
};

export default async function DealsPipelinePage() {
  const deals = await getDealStore().list();
  const kpis = computeBrokerKpis(deals);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Deal Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every submission below is a locked, hashable version snapshot — updates create a new version rather than
            mutating this record.
          </p>
        </div>
        <Button asChild>
          <Link href="/deals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Submission
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <KpiRow>
          <KpiCard label="Active Deals" value={String(kpis.activeDeals)} icon={Briefcase} />
          <KpiCard label="Carrier Bids Received" value={String(kpis.totalBidsReceived)} icon={Users} />
          <KpiCard label="Deals Closed" value={String(kpis.dealsClosed)} icon={CheckCircle2} tone="success" />
          <KpiCard
            label="Avg. Data Room Quality"
            value={`${Math.round(kpis.averageDataRoomQuality)} / 100`}
            icon={Gauge}
            tone={kpis.averageDataRoomQuality >= 60 ? "success" : "warning"}
          />
        </KpiRow>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Enterprise Value</TableHead>
              <TableHead>Signing / Closing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Snapshot Hash</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Risk Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id} className="relative">
                <TableCell>
                  <Link
                    href={`/deals/${deal.id}`}
                    className="font-medium text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:inset-0 after:content-['']"
                  >
                    {deal.target.companyName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{deal.target.jurisdiction}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">{deal.target.sector}</TableCell>
                <TableCell className="font-medium text-primary">
                  {formatCurrency(deal.financials.enterpriseValue, deal.financials.currency)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(deal.timeline.signingDate)} → {formatDate(deal.timeline.scheduledClosingDate)}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[deal.status]}>{deal.status}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground" title={deal.snapshotHash}>
                  v{deal.version} · {truncateHash(deal.snapshotHash, 6)}
                </TableCell>
                <TableCell className="text-muted-foreground">{deal.bids.length}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild className="relative">
                    <Link href={`/deals/${deal.id}/risk`}>
                      <Gauge className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      Risk Report
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {deals.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <p className="text-sm font-medium text-primary">No deals in your pipeline yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start a new submission and the extraction engine will build the underwriting grid for you.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
