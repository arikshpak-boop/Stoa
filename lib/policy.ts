import type { Bid, Deal } from "./types";

/**
 * Once a bid is accepted there's no real policy administration system
 * behind this mock, but the confirmation page needs a policy number and
 * term to feel real. Both are derived deterministically from the deal/bid
 * so they stay stable across reloads instead of being random per render.
 */
const POLICY_TERM_YEARS = 3;

export function policyNumber(deal: Deal, bid: Bid): string {
  const year = new Date(deal.createdAt).getFullYear();
  const suffix = bid.id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `WI-${year}-${suffix}`;
}

export function policyEffectiveDate(deal: Deal): string {
  return deal.timeline.scheduledClosingDate;
}

export function policyTermYears(): number {
  return POLICY_TERM_YEARS;
}

export function policyExpiryDate(deal: Deal): string {
  const effective = new Date(deal.timeline.scheduledClosingDate);
  effective.setFullYear(effective.getFullYear() + POLICY_TERM_YEARS);
  return effective.toISOString();
}
