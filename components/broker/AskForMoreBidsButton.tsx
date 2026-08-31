"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Re-solicits the panel on a deal that is already live. Distinct from
 * RequestBidsButton, which publishes a Draft deal for the first time.
 */
export function AskForMoreBidsButton({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function askForMoreBids() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`/api/v1/deals/${dealId}/bid-requests`, { method: "POST" });
      const payload = (await response.json()) as {
        notified?: string[];
        distributionSize?: number | null;
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Couldn't request more bids.");
        return;
      }

      const notified = payload.notified ?? [];
      const distributionSize = payload.distributionSize ?? null;

      if (notified.length > 0) {
        setResult(`Requested from ${notified.length} carrier${notified.length === 1 ? "" : "s"} yet to quote.`);
      } else if (distributionSize === null) {
        // No distribution list on this deal, so the request goes to the whole panel.
        setResult("Requested from the full carrier panel.");
      } else {
        setResult("Every carrier on the distribution list has already quoted.");
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button variant="outline" size="sm" disabled={busy || isPending} onClick={askForMoreBids} className="w-full">
        <Megaphone className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
        {busy || isPending ? "Requesting…" : "Ask for More Bids"}
      </Button>
      {result && <p className="mt-1.5 text-xs leading-snug text-success">{result}</p>}
      {error && <p role="alert" className="mt-1.5 text-xs leading-snug text-destructive">{error}</p>}
    </div>
  );
}
