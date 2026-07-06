"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Deal } from "@/lib/types";

const PAGE_WIDTH = 520;
const PAGE_HEIGHT = 680;
const SOURCE_CANVAS_WIDTH = 620;

type ExtractedFieldKey = keyof Deal["extractedFields"];

const FIELD_LABELS: Record<ExtractedFieldKey, string> = {
  companyName: "Target Company",
  jurisdiction: "Jurisdiction",
  sector: "Sector",
  enterpriseValue: "Enterprise Value",
  targetDebt: "Target Debt",
  targetCash: "Target Cash",
  governingLaw: "Governing Law",
  disputeResolutionVenue: "Dispute Resolution Venue",
  signingDate: "Signing Date",
  scheduledClosingDate: "Scheduled Closing Date",
};

function confidenceVariant(confidence: number): "success" | "warning" | "destructive" {
  if (confidence >= 0.85) return "success";
  if (confidence >= 0.65) return "warning";
  return "destructive";
}

function formatFieldValue(key: ExtractedFieldKey, value: string | number, currency: string): string {
  if (key === "enterpriseValue" || key === "targetDebt" || key === "targetCash") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(
      value as number,
    );
  }
  return String(value);
}

interface MockPageLine {
  top: number;
  width: string;
  isHeading: boolean;
}

function generateMockPageLines(seedKey: string, contentTop: number, contentHeight: number): MockPageLine[] {
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) {
    seed = (seed * 31 + seedKey.charCodeAt(i)) >>> 0;
  }
  const next = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return (seed >>> 8) / 0xffffff;
  };

  const lines: MockPageLine[] = [];
  let cursor = contentTop;
  let sinceHeading = 0;

  while (cursor < contentTop + contentHeight - 12) {
    const startsHeading = sinceHeading > 4 + Math.floor(next() * 3);
    if (startsHeading) {
      lines.push({ top: cursor, width: `${28 + Math.round(next() * 20)}%`, isHeading: true });
      cursor += 22;
      sinceHeading = 0;
    } else {
      const isLastInParagraph = next() > 0.75;
      lines.push({ top: cursor, width: isLastInParagraph ? `${40 + Math.round(next() * 30)}%` : `${78 + Math.round(next() * 18)}%`, isHeading: false });
      cursor += 16;
      sinceHeading += 1;
    }
  }

  return lines;
}

export function VerificationSplitView({ deal }: { deal: Deal }) {
  const fieldKeys = Object.keys(deal.extractedFields) as ExtractedFieldKey[];
  const [selectedKey, setSelectedKey] = useState<ExtractedFieldKey>(fieldKeys[0] ?? "companyName");

  const selectedField = deal.extractedFields[selectedKey];

  const scaleX = SOURCE_CANVAS_WIDTH / PAGE_WIDTH;
  const canvasHeight = SOURCE_CANVAS_WIDTH * (PAGE_HEIGHT / PAGE_WIDTH);
  const mockLines = generateMockPageLines(
    `${selectedField.sourceDocument}-${selectedField.sourcePage}`,
    56,
    canvasHeight - 56 - 16,
  );

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-lg border border-border bg-white lg:grid-cols-2">
      <div className="border-r border-border">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <p className="label-uppercase">Extracted Metadata</p>
        </div>
        <ul className="max-h-[640px] divide-y divide-border overflow-y-auto scrollbar-thin">
          {fieldKeys.map((key) => {
            const extractedField = deal.extractedFields[key];
            const isSelected = key === selectedKey;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full flex-col gap-1.5 px-5 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    isSelected ? "border-l-2 border-accent bg-accent/5" : "border-l-2 border-transparent hover:bg-muted/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {FIELD_LABELS[key]}
                    </span>
                    <Badge variant={confidenceVariant(extractedField.confidence)}>
                      {Math.round(extractedField.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {formatFieldValue(key, extractedField.value, deal.financials.currency)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    {extractedField.sourceDocument} · p.{extractedField.sourcePage}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col">
        <div className="border-b border-border bg-muted/60 px-5 py-3">
          <p className="label-uppercase">Source Document Viewer</p>
        </div>
        <div className="flex flex-1 items-start justify-center bg-secondary/5 p-6">
          <div
            className="relative shrink-0 rounded-sm border border-border bg-white shadow-sm"
            style={{ width: SOURCE_CANVAS_WIDTH, height: canvasHeight }}
          >
            <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground">
              <span>{selectedField.sourceDocument}</span>
              <span>Page {selectedField.sourcePage}</span>
            </div>
            {mockLines.map((line, lineIndex) => (
              <div
                key={lineIndex}
                className={cn("absolute left-8 rounded-sm", line.isHeading ? "h-3 bg-muted-foreground/25" : "h-2 bg-muted")}
                style={{ top: line.top, width: line.width }}
              />
            ))}
            <div
              className="absolute rounded-sm border-2 border-accent bg-accent/10"
              style={{
                left: selectedField.sourceCoordinates.x * scaleX,
                top: selectedField.sourceCoordinates.y * (scaleX * 0.9),
                width: selectedField.sourceCoordinates.width * scaleX,
                height: selectedField.sourceCoordinates.height * scaleX,
              }}
            />
          </div>
        </div>
        <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          Bounding box reflects the source attribution coordinates captured by the extraction worker for the selected
          field.
        </div>
      </div>
    </div>
  );
}
