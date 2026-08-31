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

describe("carrier-requested exclusions", () => {
  it("persists the warranties a carrier asks to exclude", async () => {
    const deal = await getDealStore().create({
      ...BASE,
      bids: [
        {
          carrierName: "Beazley",
          limitAmount: 20_000_000,
          retentionAmount: 800_000,
          retentionTrigger: "Tipping",
          rateOnLinePercent: 2.9,
          underwritingFees: 40_000,
          expenseCap: 70_000,
          policyExpiration: "2033-09-01",
          bidStatus: "Pending",
          requestedExclusions: ["TAX-01", "IP-01"],
        },
      ],
    } as SeedSpecForTest);

    expect(deal.bids[0]?.requestedExclusions).toEqual(["TAX-01", "IP-01"]);
  });

  it("defaults to an empty list when the carrier asks for none", async () => {
    const deal = await getDealStore().create({
      ...BASE,
      bids: [
        {
          carrierName: "Chubb",
          limitAmount: 10_000_000,
          retentionAmount: 400_000,
          retentionTrigger: "Erosion",
          rateOnLinePercent: 3.2,
          underwritingFees: 20_000,
          expenseCap: 40_000,
          policyExpiration: "2033-09-01",
          bidStatus: "Pending",
        },
      ],
    } as SeedSpecForTest);

    expect(deal.bids[0]?.requestedExclusions).toEqual([]);
  });
});

describe("recordBidRequest", () => {
  it("stamps the deal when the panel is re-solicited", async () => {
    const store = getDealStore();
    const deal = await store.create(BASE as SeedSpecForTest);
    expect(deal.lastBidRequestAt).toBeUndefined();

    const updated = await store.recordBidRequest(deal.id);
    expect(updated?.lastBidRequestAt).toBeTruthy();
    expect(updated?.updatedAt).toBe(updated?.lastBidRequestAt);
  });

  it("returns undefined for a deal that does not exist", async () => {
    expect(await getDealStore().recordBidRequest("no-such-deal")).toBeUndefined();
  });
});
