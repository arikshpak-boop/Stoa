"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileSpreadsheet, FileText, FolderOpen, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDropZone, type StagedFile } from "@/components/ingestion/FileDropZone";
import { formatDate } from "@/lib/utils";
import { DOCUMENT_CLASSIFICATION_LABELS } from "@/lib/document-classification";
import type { DocumentClassification, VdrDocument } from "@/lib/types";

const FILE_ICONS: Record<VdrDocument["fileType"], typeof FileText> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  docx: FileText,
};

const CLASSIFICATION_OPTIONS: DocumentClassification[] = [
  "spa-transaction-agreement",
  "financial-statement",
  "disclosure-schedule",
  "org-document",
  "correspondence",
  "unclassifiable-irrelevant",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DealDocumentsPanel({ dealId, documents }: { dealId: string; documents: VdrDocument[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);

  const excludedCount = documents.filter((doc) => !doc.includedInAnalysis).length;

  async function uploadStaged() {
    if (stagedFiles.length === 0) return;
    setBusy(true);
    try {
      await fetch(`/api/v1/deals/${dealId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: stagedFiles }),
      });
      setStagedFiles([]);
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  async function overrideClassification(documentId: string, classification: DocumentClassification) {
    setReclassifyingId(documentId);
    try {
      await fetch(`/api/v1/deals/${dealId}/documents/${documentId}/classification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classification }),
      });
      startTransition(() => router.refresh());
    } finally {
      setReclassifyingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-accent" aria-hidden="true" />
          Virtual Data Room
        </CardTitle>
        <CardDescription>
          {documents.length} document{documents.length === 1 ? "" : "s"} in the data room. New uploads are classified
          before being folded into the risk analysis
          {excludedCount > 0
            ? ` — ${excludedCount} document${excludedCount === 1 ? "" : "s"} excluded as unrecognized.`
            : "."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-0 divide-y divide-border rounded-md border border-border">
          {documents.map((doc) => {
            const Icon = FILE_ICONS[doc.fileType];
            const overrideNote = doc.classificationOverride
              ? `Reclassified by ${doc.classificationOverride.overriddenBy} on ${formatDate(doc.classificationOverride.overriddenAt)} (was ${DOCUMENT_CLASSIFICATION_LABELS[doc.classificationOverride.previousClassification]})`
              : undefined;
            return (
              <div key={doc.id} className="flex flex-col gap-2 px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-primary">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(doc.sizeBytes)} · uploaded {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={doc.status === "Parsed" ? "success" : "muted"}>{doc.status}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-6" title={overrideNote}>
                  <Badge variant={doc.includedInAnalysis ? "outline" : "warning"}>
                    {DOCUMENT_CLASSIFICATION_LABELS[doc.classification]}
                  </Badge>
                  {doc.classificationOverride && <span className="text-[11px] text-muted-foreground">Overridden</span>}
                  <Select
                    value={doc.classification}
                    onValueChange={(value) => overrideClassification(doc.id, value as DocumentClassification)}
                    disabled={reclassifyingId === doc.id}
                  >
                    <SelectTrigger className="h-7 w-auto gap-1 border-none bg-transparent px-2 py-0 text-[11px] text-muted-foreground shadow-none hover:text-primary">
                      <SelectValue placeholder="Reclassify" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSIFICATION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {DOCUMENT_CLASSIFICATION_LABELS[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!doc.includedInAnalysis && (
                  <p className="flex items-center gap-1.5 pl-6 text-xs text-warning">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Not used in analysis — unrecognized document type.
                  </p>
                )}
              </div>
            );
          })}
          {documents.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No documents uploaded yet.</p>
          )}
        </div>

        <FileDropZone files={stagedFiles} onFilesChange={setStagedFiles} />

        {stagedFiles.length > 0 && (
          <Button disabled={busy} onClick={uploadStaged}>
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            {busy ? "Adding…" : `Add ${stagedFiles.length} Document${stagedFiles.length === 1 ? "" : "s"} to Data Room`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
