"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/premium";
import type { Bid } from "@/lib/types";

const BID_STATUS_VARIANT: Record<Bid["bidStatus"], "muted" | "success" | "destructive"> = {
  Pending: "muted",
  Accepted: "success",
  Declined: "destructive",
};

interface BidsActionsTableProps {
  dealId: string;
  bids: Bid[];
  currency: string;
}

export function BidsActionsTable({ dealId, bids, currency }: BidsActionsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actingBidId, setActingBidId] = useState<string | null>(null);

  const hasAcceptedBid = bids.some((bid) => bid.bidStatus === "Accepted");

  async function updateStatus(bidId: string, bidStatus: "Accepted" | "Declined") {
    setActingBidId(bidId);
    try {
      await fetch(`/api/v1/deals/${dealId}/bids/${bidId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidStatus }),
      });
      startTransition(() => router.refresh());
    } finally {
      setActingBidId(null);
    }
  }

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
            <TableHead className="text-right">Actions</TableHead>
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
              <TableCell className="text-right">
                {bid.bidStatus === "Pending" && !hasAcceptedBid && (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending && actingBidId === bid.id}
                      onClick={() => updateStatus(bid.id, "Declined")}
                    >
                      <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      disabled={isPending && actingBidId === bid.id}
                      onClick={() => updateStatus(bid.id, "Accepted")}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      Accept
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {bids.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                No bids submitted yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
