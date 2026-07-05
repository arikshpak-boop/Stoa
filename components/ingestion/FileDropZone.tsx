"use client";

import { useCallback, useRef, useState } from "react";
import { FileSpreadsheet, FileText, Link2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StagedFile {
  fileName: string;
  fileType: "pdf" | "xlsx" | "docx";
  sizeBytes: number;
}

interface FileDropZoneProps {
  files: StagedFile[];
  onFilesChange: (files: StagedFile[]) => void;
}

const VDR_CONNECTORS = [
  { name: "Intralinks", description: "Connect an active Intralinks data room by link." },
  { name: "Datasite", description: "Sync documents directly from a Datasite project." },
  { name: "ShareVault", description: "Import an existing ShareVault workspace." },
];

function inferFileType(fileName: string): StagedFile["fileType"] | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "xlsx";
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "docx";
  return null;
}

const FILE_ICONS: Record<StagedFile["fileType"], typeof FileText> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  docx: FileText,
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropZone({ files, onFilesChange }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeConnector, setActiveConnector] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const staged: StagedFile[] = [];
      Array.from(fileList).forEach((file) => {
        const fileType = inferFileType(file.name);
        if (fileType) {
          staged.push({ fileName: file.name, fileType, sizeBytes: file.size });
        }
      });
      if (staged.length > 0) {
        onFilesChange([...files, ...staged]);
      }
    },
    [files, onFilesChange],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
          isDragging ? "border-accent bg-accent/5" : "border-border bg-white hover:border-accent/50",
        )}
      >
        <Upload className="h-8 w-8 text-accent" />
        <p className="mt-3 text-sm font-medium text-primary">Drag and drop transaction documents</p>
        <p className="mt-1 text-xs text-muted-foreground">Supports .pdf, .xlsx, .docx — multiple files at once</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.docx,.doc"
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border bg-white">
          {files.map((file, index) => {
            const Icon = FILE_ICONS[file.fileType];
            return (
              <li key={`${file.fileName}-${index}`} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-primary">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)} · {file.fileType.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${file.fileName}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <p className="label-uppercase mb-2">Virtual Data Room Connectors</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {VDR_CONNECTORS.map((connector) => (
            <button
              key={connector.name}
              type="button"
              onClick={() => setActiveConnector(connector.name)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-colors",
                activeConnector === connector.name ? "border-accent bg-accent/5" : "border-border bg-white hover:border-accent/40",
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Link2 className="h-3.5 w-3.5 text-accent" />
                {connector.name}
              </span>
              <span className="text-xs text-muted-foreground">{connector.description}</span>
            </button>
          ))}
        </div>
        {activeConnector && (
          <div className="mt-3 flex items-center justify-between rounded-md border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm">
            <span className="text-primary">
              {activeConnector} connection placeholder — API credentials not yet configured for this organization.
            </span>
            <Button size="sm" variant="outline" onClick={() => setActiveConnector(null)}>
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
