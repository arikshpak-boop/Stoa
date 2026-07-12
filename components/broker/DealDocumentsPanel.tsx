"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, FileText, FolderOpen, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropZone, type StagedFile } from "@/components/ingestion/FileDropZone";
import { formatDate } from "@/lib/utils";
import type { VdrDocument } from "@/lib/types";

const FILE_ICONS: Record<VdrDocument["fileType"], typeof FileText> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  docx: FileText,
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DealDocumentsPanel({ dealId, documents }: { dealId: string; documents: VdrDocument[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [busy, setBusy] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-accent" aria-hidden="true" />
          Virtual Data Room
        </CardTitle>
        <CardDescription>
          {documents.length} document{documents.length === 1 ? "" : "s"} in the data room. New uploads are parsed and
          folded into the risk analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-0 divide-y divide-border rounded-md border border-border">
          {documents.map((doc) => {
            const Icon = FILE_ICONS[doc.fileType];
            return (
              <div key={doc.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(doc.sizeBytes)} · uploaded {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <Badge variant={doc.status === "Parsed" ? "success" : "muted"}>{doc.status}</Badge>
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
