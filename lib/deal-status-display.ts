import type { DealStatus } from "./types";

export interface DealStatusDisplay {
  label: string;
  badgeVariant: "muted" | "default" | "warning" | "success";
}

/**
 * Broker-facing phase names mapped onto the underlying DealStatus enum:
 * Draft (pre-submission) reads as "Due Diligence", Submitted (open to
 * carrier bids) reads as "Active Bidding", Analyzed (deeper underwriting
 * review underway) reads as "Underwriting". The stored status values are
 * unchanged -- this is presentation only.
 */
export const DEAL_STATUS_DISPLAY: Record<DealStatus, DealStatusDisplay> = {
  Draft: { label: "Due Diligence", badgeVariant: "muted" },
  Submitted: { label: "Active Bidding", badgeVariant: "default" },
  Analyzed: { label: "Underwriting", badgeVariant: "warning" },
  Closed: { label: "Closed", badgeVariant: "success" },
};
