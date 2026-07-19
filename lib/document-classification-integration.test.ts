import { describe, expect, it } from "vitest";
import { buildDeal, type SeedSpec } from "./mock-store";
import { generateUnderwritingBriefing } from "./underwriting";

/**
 * Reproduces the "Industrial SHP" finding from the P0-01 ticket: an
 * irrelevant document (a personal invoice) uploaded alongside real
 * transaction documents must never surface as a citation/source anywhere
 * in extraction output or the underwriting-call briefing.
 */
function buildTestSpec(): SeedSpec {
  return {
    organizationName: "Test Broker LLC",
    target: { companyName: "Industrial SHP Holdings", jurisdiction: "Delaware, USA", sector: "Manufacturing" },
    financials: { enterpriseValue: 100_000_000, currency: "USD", targetDebt: 10_000_000, targetCash: 5_000_000 },
    legal: { governingLaw: "State of Delaware", disputeResolutionVenue: "AAA Arbitration, New York" },
    timeline: { signingDate: "2026-06-01", scheduledClosingDate: "2026-08-01" },
    status: "Submitted",
    documents: [
      { fileName: "Share_Purchase_Agreement.pdf", fileType: "pdf", sizeBytes: 3_000_000 },
      { fileName: "Financial_Model_FY25.xlsx", fileType: "xlsx", sizeBytes: 1_000_000 },
      { fileName: "Personal_Invoice_March2026.pdf", fileType: "pdf", sizeBytes: 50_000 },
      { fileName: "Travel_Itinerary_Chicago.pdf", fileType: "pdf", sizeBytes: 40_000 },
    ],
    missingDisclosuresByWarranty: {},
    bids: [],
  };
}

describe("irrelevant document exclusion from analysis", () => {
  it("marks irrelevant documents as excluded from analysis", () => {
    const deal = buildDeal(buildTestSpec());
    const invoice = deal.documents.find((d) => d.fileName === "Personal_Invoice_March2026.pdf");
    const itinerary = deal.documents.find((d) => d.fileName === "Travel_Itinerary_Chicago.pdf");

    expect(invoice?.classification).toBe("unclassifiable-irrelevant");
    expect(invoice?.includedInAnalysis).toBe(false);
    expect(itinerary?.classification).toBe("unclassifiable-irrelevant");
    expect(itinerary?.includedInAnalysis).toBe(false);
  });

  it("keeps real transaction documents included", () => {
    const deal = buildDeal(buildTestSpec());
    const spa = deal.documents.find((d) => d.fileName === "Share_Purchase_Agreement.pdf");
    expect(spa?.includedInAnalysis).toBe(true);
  });

  it("never cites an irrelevant document as the source of an extracted field", () => {
    const deal = buildDeal(buildTestSpec());
    const sources = Object.values(deal.extractedFields).map((field) => field.sourceDocument);
    expect(sources).not.toContain("Personal_Invoice_March2026.pdf");
    expect(sources).not.toContain("Travel_Itinerary_Chicago.pdf");
  });

  it("never cites an irrelevant document in the underwriting-call briefing", () => {
    const deal = buildDeal(buildTestSpec());
    const briefing = generateUnderwritingBriefing(deal);
    const sources = briefing.map((item) => item.source);
    expect(sources).not.toContain("Personal_Invoice_March2026.pdf");
    expect(sources).not.toContain("Travel_Itinerary_Chicago.pdf");
  });
});
