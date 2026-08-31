"use client";

import { useMemo, useState } from "react";
import { Check, Search, Users } from "lucide-react";
import { CARRIER_PANEL } from "@/lib/carriers";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CarrierDistributionSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CarrierDistributionSelector({ selectedIds, onChange }: CarrierDistributionSelectorProps) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return CARRIER_PANEL;
    return CARRIER_PANEL.filter((carrier) => carrier.name.toLowerCase().includes(needle));
  }, [query]);

  const selected = new Set(selectedIds);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    // Preserve panel order so the summary reads consistently.
    onChange(CARRIER_PANEL.filter((carrier) => next.has(carrier.id)).map((carrier) => carrier.id));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="font-semibold text-primary">
            {selectedIds.length} of {CARRIER_PANEL.length} carriers selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(CARRIER_PANEL.map((carrier) => carrier.id))}
            className="rounded-md px-2 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Select all
          </button>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <button
            type="button"
            onClick={() => onChange([])}
            className="rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter carriers…"
          className="pl-9"
          aria-label="Filter carriers"
        />
      </div>

      <ul className="scrollbar-thin mt-4 max-h-[340px] space-y-1.5 overflow-y-auto pr-1">
        {visible.map((carrier) => {
          const isSelected = selected.has(carrier.id);
          return (
            <li key={carrier.id}>
              <button
                type="button"
                onClick={() => toggle(carrier.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-accent-border bg-accent-tint"
                    : "border-border bg-white hover:border-accent/40 hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                    isSelected ? "border-accent bg-accent text-white" : "border-input bg-white",
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={cn("font-medium", isSelected ? "text-accent" : "text-foreground")}>
                  {carrier.name}
                </span>
              </button>
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            No carriers match “{query}”.
          </li>
        )}
      </ul>
    </div>
  );
}
