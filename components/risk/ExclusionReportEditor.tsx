"use client";

import { useState } from "react";
import { FileWarning, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ExclusionClause } from "@/lib/types";

export function ExclusionReportEditor({ exclusions }: { exclusions: ExclusionClause[] }) {
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(exclusions.map((exclusion) => [exclusion.id, exclusion.draftText])),
  );

  if (exclusions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <FileWarning className="h-5 w-5 text-success" />
          No specific exclusions triggered — every warranty is currently within Low risk tolerance.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {exclusions.map((exclusion) => {
        const isEdited = drafts[exclusion.id] !== exclusion.draftText;
        return (
          <Card key={exclusion.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm">{exclusion.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Triggered by: {exclusion.triggeredBy}</p>
              </div>
              <div className="flex items-center gap-2">
                {isEdited && <Badge variant="warning">Edited</Badge>}
                <Badge variant="outline" className="font-mono">{exclusion.warrantyIdentifier}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                value={drafts[exclusion.id]}
                onChange={(event) => setDrafts((prev) => ({ ...prev, [exclusion.id]: event.target.value }))}
                rows={4}
                className="text-sm leading-relaxed"
              />
              {isEdited && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDrafts((prev) => ({ ...prev, [exclusion.id]: exclusion.draftText }))}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Revert to generated draft
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
