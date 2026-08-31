"use client";

import { useState } from "react";
import Link from "next/link";
import { PhoneCall } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { BidForm } from "@/components/marketplace/BidForm";
import type { ExclusionClause } from "@/lib/types";

interface BidDialogProps {
  dealId: string;
  dealName: string;
  enterpriseValue: number;
  currency: string;
  carrierName: string;
  suggestedRateOnLinePercent?: number;
  recommendedExclusions?: ExclusionClause[];
  trigger: React.ReactNode;
  /** When true, offers a last-chance link into the Underwriting Call room before the bid is committed. */
  showUnderwritingCallLink?: boolean;
}

export function BidDialog({
  dealId,
  dealName,
  enterpriseValue,
  currency,
  carrierName,
  suggestedRateOnLinePercent,
  recommendedExclusions,
  trigger,
  showUnderwritingCallLink = true,
}: BidDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(event) => event.stopPropagation()}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Configure Bid — {dealName}</DialogTitle>
          <DialogDescription>Set the coverage terms you&apos;re willing to offer on this risk.</DialogDescription>
        </DialogHeader>
        {showUnderwritingCallLink && (
          <Link
            href={`/marketplace/${dealId}/underwriting-call`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-sm text-accent hover:bg-accent/10"
          >
            <PhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
            Need more comfort first? Open the Underwriting Call — 25 pre-answered questions, plus direct Q&amp;A with the deal maker.
          </Link>
        )}
        <BidForm
          dealId={dealId}
          recommendedExclusions={recommendedExclusions}
          enterpriseValue={enterpriseValue}
          currency={currency}
          carrierName={carrierName}
          suggestedRateOnLinePercent={suggestedRateOnLinePercent}
          bare
          onSubmitted={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
