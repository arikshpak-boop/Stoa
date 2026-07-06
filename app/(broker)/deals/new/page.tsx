"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileDropZone, type StagedFile } from "@/components/ingestion/FileDropZone";
import { formatCurrency } from "@/lib/premium";
import { truncateHash } from "@/lib/utils";
import type { Deal, Sector } from "@/lib/types";

const SECTORS: Sector[] = [
  "SaaS / Technology",
  "Manufacturing",
  "Healthcare",
  "Financial Services",
  "Consumer & Retail",
  "Energy & Natural Resources",
  "Business Services",
];

const STEPS = ["Target & Deal Team", "Document Ingestion", "Submit for Extraction"] as const;

export default function NewDealPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [organizationName, setOrganizationName] = useState("Meridian Capital Partners");
  const [companyName, setCompanyName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Delaware, USA");
  const [sector, setSector] = useState<Sector>("SaaS / Technology");
  const [dealValue, setDealValue] = useState(0);
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedDeal, setSubmittedDeal] = useState<Deal | null>(null);

  const canProceedFromStepOne = useMemo(
    () => organizationName.trim().length > 0 && companyName.trim().length > 0 && jurisdiction.trim().length > 0,
    [organizationName, companyName, jurisdiction],
  );

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/deals/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName, companyName, jurisdiction, sector, documents: files, dealValue }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Extraction failed.");
      }

      const payload = (await response.json()) as { deal: Deal };
      setSubmittedDeal(payload.deal);
      setIsSubmitting(false);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error during extraction.");
      setIsSubmitting(false);
    }
  }

  function handleStartAnother() {
    setSubmittedDeal(null);
    setStepIndex(0);
    setCompanyName("");
    setDealValue(0);
    setFiles([]);
    setError(null);
  }

  if (submittedDeal) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-primary">Submission Successful</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {submittedDeal.target.companyName} has been extracted, risk-scored, and locked as an immutable snapshot.
          It's now visible to carriers on the marketplace.
        </p>

        <div className="mt-6 rounded-md border border-border bg-muted/60 p-4 text-left text-sm">
          <dl className="grid grid-cols-2 gap-y-2">
            <dt className="text-muted-foreground">Target</dt>
            <dd className="text-right font-medium text-primary">{submittedDeal.target.companyName}</dd>
            <dt className="text-muted-foreground">Enterprise Value</dt>
            <dd className="text-right font-medium text-primary">
              {formatCurrency(submittedDeal.financials.enterpriseValue, submittedDeal.financials.currency)}
            </dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="text-right font-medium text-primary">{submittedDeal.status}</dd>
            <dt className="text-muted-foreground">Snapshot Hash</dt>
            <dd className="text-right font-mono text-xs text-primary">{truncateHash(submittedDeal.snapshotHash, 8)}</dd>
          </dl>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={handleStartAnother}>
            Submit Another Deal
          </Button>
          <Button asChild>
            <Link href={`/deals/${submittedDeal.id}`}>
              View Deal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">New Deal Submission</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Progressive disclosure keeps this under the 15-minute SLA — provide the target details, drop the data room
        documents, and the extraction engine pre-fills the underwriting grid for verification.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Progress
          value={((stepIndex + 1) / STEPS.length) * 100}
          aria-label={`Submission progress: step ${stepIndex + 1} of ${STEPS.length}`}
          className="flex-1"
        />
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
          Step {stepIndex + 1} of {STEPS.length}
        </span>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{STEPS[stepIndex]}</CardTitle>
          <CardDescription>
            {stepIndex === 0 && "Identify the submitting organization and the transaction target."}
            {stepIndex === 1 && "Upload SPA drafts, financial models, and disclosure schedules, or connect a VDR."}
            {stepIndex === 2 && "Confirm the submission package before routing it to the extraction engine."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {stepIndex === 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="organizationName">Submitting Organization</Label>
                <Input id="organizationName" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="companyName">Target Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Nimbus Cloud Systems, Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input id="jurisdiction" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Sector</Label>
                <Select value={sector} onValueChange={(value) => setSector(value as Sector)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="dealValue">Deal Value (USD)</Label>
                <FormattedNumberInput id="dealValue" value={dealValue} onChange={setDealValue} />
                <p className="text-xs text-muted-foreground">
                  Optional — leave blank and the extraction engine will estimate it from the uploaded documents.
                </p>
              </div>
            </div>
          )}

          {stepIndex === 1 && <FileDropZone files={files} onFilesChange={setFiles} />}

          {stepIndex === 2 && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md border border-border bg-muted/60 p-4">
                <p className="label-uppercase mb-2">Submission Summary</p>
                <dl className="grid grid-cols-2 gap-y-2">
                  <dt className="text-muted-foreground">Organization</dt>
                  <dd className="text-right font-medium text-primary">{organizationName}</dd>
                  <dt className="text-muted-foreground">Target</dt>
                  <dd className="text-right font-medium text-primary">{companyName || "—"}</dd>
                  <dt className="text-muted-foreground">Jurisdiction</dt>
                  <dd className="text-right font-medium text-primary">{jurisdiction}</dd>
                  <dt className="text-muted-foreground">Sector</dt>
                  <dd className="text-right font-medium text-primary">{sector}</dd>
                  <dt className="text-muted-foreground">Deal Value</dt>
                  <dd className="text-right font-medium text-primary">
                    {dealValue > 0 ? `$${dealValue.toLocaleString("en-US")}` : "To be estimated"}
                  </dd>
                  <dt className="text-muted-foreground">Documents Attached</dt>
                  <dd className="text-right font-medium text-primary">{files.length}</dd>
                </dl>
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" disabled={stepIndex === 0 || isSubmitting} onClick={() => setStepIndex((s) => s - 1)}>
          Back
        </Button>
        {stepIndex < STEPS.length - 1 ? (
          <Button disabled={stepIndex === 0 && !canProceedFromStepOne} onClick={() => setStepIndex((s) => s + 1)}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Routing to Extraction Engine…
              </>
            ) : (
              "Submit for Extraction"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
