"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { groupedLibraryExclusions, type LibraryExclusion } from "@/lib/exclusion-library";
import type { CustomExclusion, ExclusionClause, WarrantyIdentifier } from "@/lib/types";

interface ExclusionPickerProps {
  /** The deal's own exclusion report — the system's recommendations. */
  recommended: ExclusionClause[];
  selectedRecommended: WarrantyIdentifier[];
  onRecommendedChange: (ids: WarrantyIdentifier[]) => void;
  selectedLibrary: string[];
  onLibraryChange: (ids: string[]) => void;
  customExclusions: CustomExclusion[];
  onCustomChange: (exclusions: CustomExclusion[]) => void;
}

function SelectRow({
  selected,
  onToggle,
  title,
  meta,
  body,
}: {
  selected: boolean;
  onToggle: () => void;
  title: string;
  meta?: React.ReactNode;
  body: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li
      className={cn(
        "rounded-lg border transition-colors",
        selected ? "border-accent bg-accent-tint" : "border-border bg-white",
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: selected ? "#0E6AED" : "#DEDEDE", background: selected ? "#0E6AED" : "#fff" }}
        >
          {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />}
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onToggle} className="block w-full text-left">
            <span className={cn("text-sm font-semibold", selected ? "text-accent" : "text-primary")}>{title}</span>
            {meta}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-accent"
          >
            {expanded ? "Hide" : "Show"} policy wording
            <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} aria-hidden="true" />
          </button>
          {expanded && (
            <p className="mt-2 rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground">{body}</p>
          )}
        </div>
      </div>
    </li>
  );
}

export function ExclusionPicker({
  recommended,
  selectedRecommended,
  onRecommendedChange,
  selectedLibrary,
  onLibraryChange,
  customExclusions,
  onCustomChange,
}: ExclusionPickerProps) {
  const [query, setQuery] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftWording, setDraftWording] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

  const recommendedSet = new Set(selectedRecommended);
  const librarySet = new Set(selectedLibrary);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groupedLibraryExclusions()
      .map((group) => ({
        ...group,
        items: needle
          ? group.items.filter(
              (item) =>
                item.name.toLowerCase().includes(needle) ||
                item.category.toLowerCase().includes(needle) ||
                item.description.toLowerCase().includes(needle),
            )
          : group.items,
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  function toggleRecommended(id: WarrantyIdentifier) {
    const next = new Set(recommendedSet);
    next.has(id) ? next.delete(id) : next.add(id);
    onRecommendedChange(recommended.map((c) => c.warrantyIdentifier).filter((c) => next.has(c)));
  }

  function toggleLibrary(item: LibraryExclusion) {
    const next = new Set(librarySet);
    next.has(item.id) ? next.delete(item.id) : next.add(item.id);
    onLibraryChange(
      groupedLibraryExclusions()
        .flatMap((g) => g.items)
        .filter((i) => next.has(i.id))
        .map((i) => i.id),
    );
  }

  function addCustom() {
    const title = draftTitle.trim();
    const wording = draftWording.trim();
    if (!title) return setDraftError("Give the exclusion a title.");
    if (!wording) return setDraftError("Add the policy wording.");
    onCustomChange([...customExclusions, { title, wording }]);
    setDraftTitle("");
    setDraftWording("");
    setDraftError(null);
  }

  const totalSelected = selectedRecommended.length + selectedLibrary.length + customExclusions.length;

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        {totalSelected} exclusion{totalSelected === 1 ? "" : "s"} attached to this quote.
      </p>

      {/* Tier 1 — the platform's own recommendations for this deal. */}
      <section>
        <h4 className="flex items-center gap-2 font-sans text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
          Recommended for this deal
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Drafted by the risk engine from this deal&apos;s disclosure gaps.
        </p>
        {recommended.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            The risk engine did not flag any exclusions for this deal.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recommended.map((clause) => (
              <SelectRow
                key={clause.warrantyIdentifier}
                selected={recommendedSet.has(clause.warrantyIdentifier)}
                onToggle={() => toggleRecommended(clause.warrantyIdentifier)}
                title={clause.title}
                meta={
                  <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                    {clause.warrantyIdentifier}
                  </span>
                }
                body={clause.draftText}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Tier 2 — the standard market library. */}
      <section>
        <h4 className="font-sans text-sm font-semibold text-primary">Standard exclusion library</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Fifty market-standard exclusions, ordered by how routinely they are applied.
        </p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name, category, or description…"
            className="pl-11"
            aria-label="Filter exclusion library"
          />
        </div>

        <div className="scrollbar-thin mt-4 max-h-[420px] space-y-5 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.frequency}>
              <p className="label-uppercase sticky top-0 bg-white py-1">{group.frequency}</p>
              <ul className="mt-2 space-y-2">
                {group.items.map((item) => (
                  <SelectRow
                    key={item.id}
                    selected={librarySet.has(item.id)}
                    onToggle={() => toggleLibrary(item)}
                    title={item.name}
                    meta={
                      <>
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {item.category}
                        </span>
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">{item.description}</span>
                      </>
                    }
                    body={item.wording}
                  />
                ))}
              </ul>
            </div>
          ))}
          {groups.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No library exclusions match &ldquo;{query}&rdquo;.
            </p>
          )}
        </div>
      </section>

      {/* Tier 3 — free-drafted. */}
      <section>
        <h4 className="font-sans text-sm font-semibold text-primary">Add your own</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          For anything the library does not cover — drafted in your own wording.
        </p>

        {customExclusions.length > 0 && (
          <ul className="mt-3 space-y-2">
            {customExclusions.map((exclusion, index) => (
              <li key={`${exclusion.title}-${index}`} className="rounded-lg border border-accent bg-accent-tint p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-accent">{exclusion.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{exclusion.wording}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCustomChange(customExclusions.filter((_, i) => i !== index))}
                    aria-label={`Remove ${exclusion.title}`}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 rounded-lg border border-border p-4">
          <Label htmlFor="custom-exclusion-title">Exclusion title</Label>
          <Input
            id="custom-exclusion-title"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="e.g. Legacy Distributor Agreements"
            className="mt-1.5"
          />
          <Label htmlFor="custom-exclusion-wording" className="mt-4 block">
            Policy wording
          </Label>
          <Textarea
            id="custom-exclusion-wording"
            value={draftWording}
            onChange={(event) => setDraftWording(event.target.value)}
            rows={3}
            placeholder="The Insurer shall not be liable for any Loss arising out of…"
            className="mt-1.5"
          />
          {draftError && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {draftError}
            </p>
          )}
          <Button type="button" variant="outline" size="sm" onClick={addCustom} className="mt-4">
            <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Add exclusion
          </Button>
        </div>
      </section>
    </div>
  );
}
