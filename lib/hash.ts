import { createHash } from "crypto";
import type { DealSnapshotInput } from "./types";

/**
 * Deterministic canonicalization is required so that key ordering never
 * changes the resulting digest — SHA256(DealMetadata || WarrantyChecklist || FilePayloadURIs).
 */
function canonicalize(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sortedKeys = Object.keys(record).sort();
    const entries = sortedKeys.map((key) => `"${key}":${canonicalize(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function computeSnapshotHash(input: DealSnapshotInput): string {
  const dealMetadata = canonicalize({
    target: input.target,
    financials: input.financials,
    legal: input.legal,
    timeline: input.timeline,
  });

  const warrantyChecklist = canonicalize(
    input.warranties.map((warranty) => ({
      warrantyIdentifier: warranty.warrantyIdentifier,
      severityScore: warranty.severityScore,
      riskLevel: warranty.riskLevel,
      flagStatus: warranty.flagStatus,
    })),
  );

  const filePayloadUris = canonicalize([...input.documentUris].sort());

  const payload = `${dealMetadata}||${warrantyChecklist}||${filePayloadUris}`;

  return createHash("sha256").update(payload, "utf8").digest("hex");
}
