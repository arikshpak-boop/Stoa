"use client";

import { Input } from "./input";

interface FormattedNumberInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
}

export function FormattedNumberInput({ id, value, onChange }: FormattedNumberInputProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/[^0-9]/g, "");
    onChange(digitsOnly === "" ? 0 : Number(digitsOnly));
  }

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="0"
      className="text-right tabular-nums"
      value={value === 0 ? "" : value.toLocaleString("en-US")}
      onChange={handleChange}
    />
  );
}
