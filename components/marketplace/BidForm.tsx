"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateLimitPercentOfEv, calculatePremium, formatCurrency } from "@/lib/premium";

interface BidFormProps {
  dealId: string;
  enterpriseValue: number;
  currency: string;
  carrierName: string;
  suggestedRateOnLinePercent?: number;
  /** Renders just the form (no Card chrome) for use inside a Dialog, which already provides its own title/description. */
  bare?: boolean;
  /** Called a moment after a successful submission, e.g. to close a hosting dialog. */
  onSubmitted?: () => void;
}

export function BidForm({
  dealId,
  enterpriseValue,
  currency,
  carrierName: initialCarrierName,
  suggestedRateOnLinePercent,
  bare = false,
  onSubmitted,
}: BidFormProps) {
  const router = useRouter();
  const [carrierName, setCarrierName] = useState(initialCarrierName);
  const [limitAmount, setLimitAmount] = useState(Math.round(enterpriseValue * 0.15));
  const [retentionAmount, setRetentionAmount] = useState(Math.round(enterpriseValue * 0.005));
  const [retentionTrigger, setRetentionTrigger] = useState<"Tipping" | "Erosion">("Tipping");
  const [rateOnLinePercent, setRateOnLinePercent] = useState(suggestedRateOnLinePercent ?? 2.75);
  const [underwritingFees, setUnderwritingFees] = useState(45000);
  const [expenseCap, setExpenseCap] = useState(75000);
  const [policyExpiration, setPolicyExpiration] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 7);
    return date.toISOString().slice(0, 10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const limitPercentOfEv = useMemo(() => calculateLimitPercentOfEv(limitAmount, enterpriseValue), [limitAmount, enterpriseValue]);
  const calculation = useMemo(
    () => calculatePremium({ limitAmount, rateOnLinePercent, underwritingFees }),
    [limitAmount, rateOnLinePercent, underwritingFees],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const response = await fetch(`/api/v1/deals/${dealId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrierName,
          limitAmount,
          retentionAmount,
          retentionTrigger,
          rateOnLinePercent,
          underwritingFees,
          expenseCap,
          policyExpiration,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Bid submission failed.");
      }

      setSubmitSuccess(true);
      router.refresh();
      if (onSubmitted) {
        setTimeout(onSubmitted, 1400);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unexpected error submitting bid.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const formBody = (
    <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="carrierName">Carrier</Label>
            <Input id="carrierName" value={carrierName} onChange={(e) => setCarrierName(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="limitAmount">Limit of Liability ({currency})</Label>
              <FormattedNumberInput id="limitAmount" value={limitAmount} onChange={setLimitAmount} />
              <p className="text-xs text-muted-foreground">{limitPercentOfEv}% of Enterprise Value</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rateOnLine">Rate on Line (%)</Label>
              <Input
                id="rateOnLine"
                type="number"
                step="0.01"
                min={0}
                value={rateOnLinePercent}
                onChange={(e) => setRateOnLinePercent(Number(e.target.value))}
              />
              {suggestedRateOnLinePercent !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Recommended: {suggestedRateOnLinePercent.toFixed(2)}%
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="retentionAmount">Aggregate Deductible ({currency})</Label>
              <FormattedNumberInput id="retentionAmount" value={retentionAmount} onChange={setRetentionAmount} />
            </div>
            <div className="space-y-1.5">
              <Label>Retention Trigger</Label>
              <Select value={retentionTrigger} onValueChange={(value) => setRetentionTrigger(value as "Tipping" | "Erosion")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tipping">Tipping</SelectItem>
                  <SelectItem value="Erosion">Erosion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="underwritingFees">Underwriting Fees ({currency})</Label>
              <FormattedNumberInput id="underwritingFees" value={underwritingFees} onChange={setUnderwritingFees} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expenseCap">Expense Cap ({currency})</Label>
              <FormattedNumberInput id="expenseCap" value={expenseCap} onChange={setExpenseCap} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="policyExpiration">Policy Expiration</Label>
              <Input
                id="policyExpiration"
                type="date"
                value={policyExpiration}
                onChange={(e) => setPolicyExpiration(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
            <p className="label-uppercase mb-2">Suggested Premium Bid</p>
            <dl className="grid grid-cols-3 gap-y-2 text-sm tabular-nums">
              <dt className="text-muted-foreground">Gross Premium</dt>
              <dd className="col-span-2 text-right font-semibold text-primary">
                {formatCurrency(calculation.grossPremium, currency)}
              </dd>
              <dt className="text-muted-foreground">Underwriting Fees</dt>
              <dd className="col-span-2 text-right text-primary">{formatCurrency(calculation.underwritingFees, currency)}</dd>
              <dt className="text-muted-foreground">Total Transaction Value</dt>
              <dd className="col-span-2 text-right font-semibold text-primary">
                {formatCurrency(calculation.totalTransactionValue, currency)}
              </dd>
            </dl>
          </div>

          {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
          {submitSuccess && <p role="status" className="text-sm text-success">Bid submitted to the broker for review.</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Bid…
              </>
            ) : (
              "Submit Bid"
            )}
          </Button>
        </form>
  );

  if (bare) {
    return formBody;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Bid</CardTitle>
        <CardDescription>Set the coverage terms you&apos;re willing to offer on this risk.</CardDescription>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
}
