"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Publishes a Draft deal to the carrier marketplace (status -> Submitted),
 * which is what "requesting bids" actually means on this platform: only
 * Submitted/Analyzed deals appear in carriers' Open Bidding Opportunities.
 */
export function RequestBidsButton({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function requestBids() {
    setBusy(true);
    try {
      await fetch(`/api/v1/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Submitted" }),
      });
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button size="sm" disabled={busy || isPending} onClick={requestBids}>
      <Radio className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
      {busy || isPending ? "Publishing…" : "Request Bids"}
    </Button>
  );
}
