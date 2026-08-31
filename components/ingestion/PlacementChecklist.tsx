"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CHECKLIST_DOCUMENT_COUNT,
  PLACEMENT_CHECKLIST,
  matchChecklistIds,
} from "@/lib/placement-checklist";

/**
 * Placement guidance shown alongside ingestion: what carriers expect to see,
 * and what each document is actually read for. Matching is a filename
 * heuristic, so it prompts rather than certifies — the copy says so.
 */
export function PlacementChecklist({ fileNames }: { fileNames: string[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const matched = useMemo(() => matchChecklistIds(fileNames), [fileNames]);
  const percent = Math.round((matched.size / CHECKLIST_DOCUMENT_COUNT) * 100);

  return (
    <aside className="rounded-lg border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-sm font-semibold text-primary">Placement checklist</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            What carriers expect in a W&amp;I submission. Tap a document to see what they read it for.
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
          {matched.size}/{CHECKLIST_DOCUMENT_COUNT}
        </span>
      </div>

      <Progress
        value={percent}
        aria-label={`${matched.size} of ${CHECKLIST_DOCUMENT_COUNT} expected documents recognised`}
        className="mt-4 h-1.5"
      />

      <div className="scrollbar-thin mt-5 max-h-[460px] space-y-5 overflow-y-auto pr-1">
        {PLACEMENT_CHECKLIST.map((group) => {
          const groupMatched = group.documents.filter((doc) => matched.has(doc.id)).length;
          return (
            <div key={group.category}>
              <p className="label-uppercase flex items-center justify-between">
                <span>{group.category}</span>
                <span className="tabular-nums">
                  {groupMatched}/{group.documents.length}
                </span>
              </p>
              <ul className="mt-2 space-y-1">
                {group.documents.map((document) => {
                  const isMatched = matched.has(document.id);
                  const isOpen = openId === document.id;
                  return (
                    <li key={document.id}>
                      <button
                        type="button"
                        title={document.focus}
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : document.id)}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isOpen && "bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            isMatched ? "border-success bg-success text-white" : "border-input bg-white",
                          )}
                          aria-hidden="true"
                        >
                          {isMatched && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                        </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 text-xs leading-snug",
                            isMatched ? "font-medium text-primary" : "text-muted-foreground",
                          )}
                        >
                          {document.name}
                        </span>
                        <ChevronDown
                          className={cn(
                            "mt-0.5 h-3 w-3 shrink-0 text-subtle transition-transform",
                            isOpen && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <p className="ml-6 mr-2 mt-1 flex gap-2 rounded-md bg-accent-tint px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                          <Info className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
                          {document.focus}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-subtle">
        Ticks are matched from file names, so treat them as a prompt rather than confirmation.
        Nothing here blocks submission.
      </p>
    </aside>
  );
}
