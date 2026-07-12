"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { BidForm } from "@/components/marketplace/BidForm";

interface BidDialogProps {
  dealId: string;
  dealName: string;
  enterpriseValue: number;
  currency: string;
  carrierName: string;
  suggestedRateOnLinePercent?: number;
  trigger: React.ReactNode;
}

export function BidDialog({
  dealId,
  dealName,
  enterpriseValue,
  currency,
  carrierName,
  suggestedRateOnLinePercent,
  trigger,
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
        <BidForm
          dealId={dealId}
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
