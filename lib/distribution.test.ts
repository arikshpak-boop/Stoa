import { describe, expect, it } from "vitest";
import { getDealStore } from "./mock-store";
import type { SeedSpecForTest } from "./mock-store";

const BASE = {
  organizationName: "Meridian Capital Partners",
  target: { companyName: "Testco", jurisdiction: "Delaware, USA", sector: "SaaS / Technology" as const },
  financials: { enterpriseValue: 100_000_000, currency: "USD", targetDebt: 0, targetCash: 0 },
  legal: { governingLaw: "Delaware", disputeResolutionVenue: "Delaware" },
  timeline: { signingDate: "2026-09-01", scheduledClosingDate: "2026-10-01" },
  status: "Submitted" as const,
  documents: [],
  missingDisclosuresByWarranty: {},
  bids: [],
};

describe("deal distribution persistence", () => {
  it("records the selected carriers with their resolved names", async () => {
    const deal = await getDealStore().create({
      ...BASE,
      distributionCarrierIds: ["aig", "beazley", "chubb"],
    } as SeedSpecForTest);

    expect(deal.distribution).toBeDefined();
    expect(deal.distribution?.carrierIds).toEqual(["aig", "beazley", "chubb"]);
    expect(deal.distribution?.carrierNames).toEqual(["AIG", "Beazley", "Chubb"]);
    expect(deal.distribution?.selectedAt).toBeTruthy();
  });

  it("leaves distribution unset when no carriers are supplied", async () => {
    const deal = await getDealStore().create(BASE as SeedSpecForTest);
    expect(deal.distribution).toBeUndefined();
  });
});
