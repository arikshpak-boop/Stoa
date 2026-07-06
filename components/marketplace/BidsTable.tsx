import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/premium";
import type { Bid } from "@/lib/types";

const BID_STATUS_VARIANT: Record<Bid["bidStatus"], "muted" | "success" | "destructive"> = {
  Pending: "muted",
  Accepted: "success",
  Declined: "destructive",
};

interface BidsTableProps {
  bids: Bid[];
  currency: string;
}

export function BidsTable({ bids, currency }: BidsTableProps) {
  return (
    <div className="rounded-lg border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Carrier</TableHead>
            <TableHead>Limit</TableHead>
            <TableHead>Retention</TableHead>
            <TableHead>RoL</TableHead>
            <TableHead>Premium</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell className="font-medium text-primary">{bid.carrierName}</TableCell>
              <TableCell>
                {formatCurrency(bid.limitAmount, currency)}{" "}
                <span className="text-xs text-muted-foreground">({bid.limitPercentOfEv}% EV)</span>
              </TableCell>
              <TableCell>
                {formatCurrency(bid.retentionAmount, currency)}{" "}
                <span className="text-xs text-muted-foreground">({bid.retentionTrigger})</span>
              </TableCell>
              <TableCell>{bid.rateOnLinePercent}%</TableCell>
              <TableCell className="font-medium text-primary">{formatCurrency(bid.premiumTotal, currency)}</TableCell>
              <TableCell>
                <Badge variant={BID_STATUS_VARIANT[bid.bidStatus]}>{bid.bidStatus}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {bids.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                No bids submitted yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
