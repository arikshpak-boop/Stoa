"use client";

import { cn } from "@/lib/utils";
import { Input } from "./input";

interface FormattedNumberInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function FormattedNumberInput({ id, value, onChange, className }: FormattedNumberInputProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/[^0-9]/g, "");
    onChange(digitsOnly === "" ? 0 : Number(digitsOnly));
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden="true">
        $
      </span>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="0"
        className={cn("pl-6 text-right tabular-nums", className)}
        value={value === 0 ? "" : value.toLocaleString("en-US")}
        onChange={handleChange}
      />
    </div>
  );
}
