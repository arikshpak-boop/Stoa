import { randomUUID } from "crypto";
import { computeSnapshotHash } from "./hash";
import { calculateLimitPercentOfEv, calculatePremium } from "./premium";
import { computeWarrantyRiskProfile, generateExclusionReport } from "./risk-engine";
import { assessDataRoomQuality } from "./dd-quality";
import type {
  Bid,
  Deal,
  DealFinancials,
  DealLegal,
  DealTarget,
  DealTimeline,
  ExtractedField,
  Sector,
  VdrDocument,
  WarrantyIdentifier,
} from "./types";

interface SeedSpec {
  organizationName: string;
  target: DealTarget;
  financials: DealFinancials;
  legal: DealLegal;
  timeline: DealTimeline;
  status: Deal["status"];
  documents: Array<{ fileName: string; fileType: VdrDocument["fileType"]; sizeBytes: number }>;
  missingDisclosuresByWarranty: Partial<Record<WarrantyIdentifier, string[]>>;
  bids: Array<{
    carrierName: string;
    limitAmount: number;
    retentionAmount: number;
    retentionTrigger: "Tipping" | "Erosion";
    rateOnLinePercent: number;
    underwritingFees: number;
    expenseCap: number;
    policyExpiration: string;
    bidStatus: Bid["bidStatus"];
  }>;
  fieldConfidence?: {
    companyName: number;
    jurisdiction: number;
    sector: number;
    enterpriseValue: number;
    targetDebt: number;
    targetCash: number;
    governingLaw: number;
    disputeResolutionVenue: number;
    signingDate: number;
    scheduledClosingDate: number;
  };
}

const DEFAULT_SEED_CONFIDENCE = {
  companyName: 0.98,
  jurisdiction: 0.94,
  sector: 0.89,
  enterpriseValue: 0.96,
  targetDebt: 0.91,
  targetCash: 0.91,
  governingLaw: 0.97,
  disputeResolutionVenue: 0.93,
  signingDate: 0.99,
  scheduledClosingDate: 0.87,
};

function field<T>(value: T, confidence: number, sourceDocument: string, sourcePage: number): ExtractedField<T> {
  return {
    value,
    confidence,
    sourceDocument,
    sourcePage,
    sourceCoordinates: { x: 72, y: 128 + sourcePage * 4, width: 420, height: 22 },
  };
}

function buildDeal(spec: SeedSpec): Deal {
  const dealId = randomUUID();
  const now = new Date().toISOString();
  const confidence = spec.fieldConfidence ?? DEFAULT_SEED_CONFIDENCE;

  const documents: VdrDocument[] = spec.documents.map((doc) => ({
    id: randomUUID(),
    fileName: doc.fileName,
    fileType: doc.fileType,
    sizeBytes: doc.sizeBytes,
    uploadedAt: now,
    status: "Parsed",
  }));

  const warranties = computeWarrantyRiskProfile(dealId, {
    sector: spec.target.sector,
    documentCount: documents.length,
    missingDisclosuresByWarranty: spec.missingDisclosuresByWarranty,
  });

  const exclusions = generateExclusionReport(dealId, warranties);

  const missingDisclosureCount = warranties.reduce((total, warranty) => total + warranty.missingDisclosures.length, 0);
  const confidenceValues = Object.values(confidence);
  const averageExtractionConfidence = confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length;

  const ddQuality = assessDataRoomQuality({
    documentCount: documents.length,
    missingDisclosureCount,
    averageExtractionConfidence,
  });

  const snapshotHash = computeSnapshotHash({
    target: spec.target,
    financials: spec.financials,
    legal: spec.legal,
    timeline: spec.timeline,
    warranties,
    documentUris: documents.map((d) => `vdr://${dealId}/${d.id}/${d.fileName}`),
  });

  const bids: Bid[] = spec.bids.map((bidSpec) => {
    const calc = calculatePremium({
      limitAmount: bidSpec.limitAmount,
      rateOnLinePercent: bidSpec.rateOnLinePercent,
      underwritingFees: bidSpec.underwritingFees,
    });
    return {
      id: randomUUID(),
      dealId,
      carrierId: randomUUID(),
      carrierName: bidSpec.carrierName,
      limitAmount: bidSpec.limitAmount,
      limitPercentOfEv: calculateLimitPercentOfEv(bidSpec.limitAmount, spec.financials.enterpriseValue),
      retentionAmount: bidSpec.retentionAmount,
      retentionTrigger: bidSpec.retentionTrigger,
      rateOnLinePercent: bidSpec.rateOnLinePercent,
      premiumTotal: calc.grossPremium,
      underwritingFees: bidSpec.underwritingFees,
      expenseCap: bidSpec.expenseCap,
      policyExpiration: bidSpec.policyExpiration,
      bidStatus: bidSpec.bidStatus,
      submittedAt: now,
    };
  });

  return {
    id: dealId,
    organizationId: randomUUID(),
    organizationName: spec.organizationName,
    status: spec.status,
    target: spec.target,
    financials: spec.financials,
    legal: spec.legal,
    timeline: spec.timeline,
    documents,
    extractedFields: {
      companyName: field(spec.target.companyName, confidence.companyName, documents[0]?.fileName ?? "SPA_Draft.pdf", 1),
      jurisdiction: field(spec.target.jurisdiction, confidence.jurisdiction, documents[0]?.fileName ?? "SPA_Draft.pdf", 1),
      sector: field(spec.target.sector, confidence.sector, documents[0]?.fileName ?? "SPA_Draft.pdf", 2),
      enterpriseValue: field(spec.financials.enterpriseValue, confidence.enterpriseValue, documents[0]?.fileName ?? "SPA_Draft.pdf", 4),
      targetDebt: field(spec.financials.targetDebt, confidence.targetDebt, documents[1]?.fileName ?? "Financial_Model.xlsx", 1),
      targetCash: field(spec.financials.targetCash, confidence.targetCash, documents[1]?.fileName ?? "Financial_Model.xlsx", 1),
      governingLaw: field(spec.legal.governingLaw, confidence.governingLaw, documents[0]?.fileName ?? "SPA_Draft.pdf", 42),
      disputeResolutionVenue: field(spec.legal.disputeResolutionVenue, confidence.disputeResolutionVenue, documents[0]?.fileName ?? "SPA_Draft.pdf", 42),
      signingDate: field(spec.timeline.signingDate, confidence.signingDate, documents[0]?.fileName ?? "SPA_Draft.pdf", 1),
      scheduledClosingDate: field(spec.timeline.scheduledClosingDate, confidence.scheduledClosingDate, documents[0]?.fileName ?? "SPA_Draft.pdf", 1),
    },
    warranties,
    exclusions,
    bids,
    ddQuality,
    version: 1,
    snapshotHash,
    createdAt: now,
    updatedAt: now,
  };
}

const SEED_SPECS: SeedSpec[] = [
  {
    organizationName: "Meridian Capital Partners",
    target: { companyName: "Nimbus Cloud Systems, Inc.", jurisdiction: "Delaware, USA", sector: "SaaS / Technology" },
    financials: { enterpriseValue: 185_000_000, currency: "USD", targetDebt: 12_500_000, targetCash: 8_200_000 },
    legal: { governingLaw: "State of Delaware", disputeResolutionVenue: "AAA Arbitration, New York" },
    timeline: { signingDate: "2026-06-20", scheduledClosingDate: "2026-08-15" },
    status: "Submitted",
    documents: [
      { fileName: "SPA_Draft_v3.pdf", fileType: "pdf", sizeBytes: 4_200_000 },
      { fileName: "Financial_Model_FY25.xlsx", fileType: "xlsx", sizeBytes: 1_800_000 },
      { fileName: "Disclosure_Schedule.docx", fileType: "docx", sizeBytes: 620_000 },
    ],
    missingDisclosuresByWarranty: {
      "IP-01": ["Open-source license audit", "Patent assignment register"],
      "CONTR-01": ["Top-10 customer contract change-of-control clauses"],
    },
    bids: [
      { carrierName: "Atlas Assurance Group", limitAmount: 27_750_000, retentionAmount: 925_000, retentionTrigger: "Tipping", rateOnLinePercent: 2.8, underwritingFees: 45_000, expenseCap: 75_000, policyExpiration: "2033-08-15", bidStatus: "Pending" },
      { carrierName: "Beacon Hill Specialty Re", limitAmount: 18_500_000, retentionAmount: 740_000, retentionTrigger: "Erosion", rateOnLinePercent: 3.1, underwritingFees: 38_000, expenseCap: 60_000, policyExpiration: "2033-08-15", bidStatus: "Pending" },
    ],
  },
  {
    organizationName: "Harrowgate & Voss LLP",
    target: { companyName: "Ferro Dynamics Manufacturing Ltd.", jurisdiction: "England & Wales", sector: "Manufacturing" },
    financials: { enterpriseValue: 92_000_000, currency: "USD", targetDebt: 21_000_000, targetCash: 4_100_000 },
    legal: { governingLaw: "England & Wales", disputeResolutionVenue: "LCIA Arbitration, London" },
    timeline: { signingDate: "2026-05-30", scheduledClosingDate: "2026-07-31" },
    status: "Analyzed",
    documents: [
      { fileName: "Share_Purchase_Agreement.pdf", fileType: "pdf", sizeBytes: 3_600_000 },
      { fileName: "Environmental_Phase_I_Report.pdf", fileType: "pdf", sizeBytes: 5_100_000 },
    ],
    missingDisclosuresByWarranty: {
      "ENV-01": ["Phase II remediation cost estimate", "Historical landfill usage records"],
      "EMPL-01": ["Works council consultation minutes"],
    },
    bids: [
      { carrierName: "Cobalt Line Underwriters", limitAmount: 13_800_000, retentionAmount: 460_000, retentionTrigger: "Tipping", rateOnLinePercent: 3.4, underwritingFees: 32_000, expenseCap: 55_000, policyExpiration: "2033-07-31", bidStatus: "Pending" },
    ],
  },
  {
    organizationName: "Silverline Advisory",
    target: { companyName: "Verdant Health Diagnostics Corp.", jurisdiction: "New York, USA", sector: "Healthcare" },
    financials: { enterpriseValue: 340_000_000, currency: "USD", targetDebt: 55_000_000, targetCash: 22_000_000 },
    legal: { governingLaw: "State of New York", disputeResolutionVenue: "ICC Arbitration, New York" },
    timeline: { signingDate: "2026-07-01", scheduledClosingDate: "2026-09-30" },
    status: "Submitted",
    documents: [
      { fileName: "Merger_Agreement.pdf", fileType: "pdf", sizeBytes: 6_400_000 },
      { fileName: "Regulatory_Compliance_Binder.docx", fileType: "docx", sizeBytes: 2_900_000 },
      { fileName: "Q1_FY26_Financials.xlsx", fileType: "xlsx", sizeBytes: 1_100_000 },
    ],
    missingDisclosuresByWarranty: {
      "TAX-01": ["State tax nexus study"],
      "CONTR-01": ["Payor contract renegotiation clauses", "Group purchasing organization agreements"],
      "EMPL-01": ["Physician non-compete enforceability memo"],
    },
    bids: [],
  },
  {
    organizationName: "Northgate M&A Advisors",
    target: { companyName: "Solace Energy Holdings plc", jurisdiction: "Scotland, UK", sector: "Energy & Natural Resources" },
    financials: { enterpriseValue: 610_000_000, currency: "USD", targetDebt: 140_000_000, targetCash: 33_000_000 },
    legal: { governingLaw: "Scotland", disputeResolutionVenue: "LCIA Arbitration, London" },
    timeline: { signingDate: "2026-04-18", scheduledClosingDate: "2026-06-30" },
    status: "Closed",
    documents: [
      { fileName: "SPA_Executed.pdf", fileType: "pdf", sizeBytes: 5_700_000 },
      { fileName: "Environmental_Liability_Report.pdf", fileType: "pdf", sizeBytes: 8_300_000 },
      { fileName: "Reserve_Report_2025.xlsx", fileType: "xlsx", sizeBytes: 2_200_000 },
    ],
    missingDisclosuresByWarranty: {},
    bids: [
      { carrierName: "Atlas Assurance Group", limitAmount: 91_500_000, retentionAmount: 3_050_000, retentionTrigger: "Tipping", rateOnLinePercent: 2.4, underwritingFees: 120_000, expenseCap: 180_000, policyExpiration: "2033-06-30", bidStatus: "Accepted" },
      { carrierName: "Beacon Hill Specialty Re", limitAmount: 61_000_000, retentionAmount: 2_400_000, retentionTrigger: "Erosion", rateOnLinePercent: 2.7, underwritingFees: 98_000, expenseCap: 150_000, policyExpiration: "2033-06-30", bidStatus: "Declined" },
    ],
  },
  {
    organizationName: "Meridian Capital Partners",
    target: { companyName: "Pinnacle Retail Collective Inc.", jurisdiction: "California, USA", sector: "Consumer & Retail" },
    financials: { enterpriseValue: 76_000_000, currency: "USD", targetDebt: 9_000_000, targetCash: 5_600_000 },
    legal: { governingLaw: "State of California", disputeResolutionVenue: "JAMS Arbitration, San Francisco" },
    timeline: { signingDate: "2026-07-10", scheduledClosingDate: "2026-09-05" },
    status: "Draft",
    documents: [{ fileName: "LOI_Draft.pdf", fileType: "pdf", sizeBytes: 480_000 }],
    missingDisclosuresByWarranty: {
      "CONTR-01": ["Store lease change-of-control provisions"],
      "EMPL-01": ["California wage and hour class action review"],
    },
    bids: [],
  },
];

class DealStore {
  private deals: Map<string, Deal> = new Map();

  constructor() {
    for (const spec of SEED_SPECS) {
      const deal = buildDeal(spec);
      this.deals.set(deal.id, deal);
    }
  }

  list(): Deal[] {
    return Array.from(this.deals.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  get(dealId: string): Deal | undefined {
    return this.deals.get(dealId);
  }

  create(spec: SeedSpec): Deal {
    const deal = buildDeal(spec);
    this.deals.set(deal.id, deal);
    return deal;
  }

  addBid(dealId: string, bid: Bid): Deal | undefined {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const updated: Deal = { ...deal, bids: [...deal.bids, bid], updatedAt: new Date().toISOString() };
    this.deals.set(dealId, updated);
    return updated;
  }

  updateBidStatus(dealId: string, bidId: string, bidStatus: Bid["bidStatus"]): Deal | undefined {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const updated: Deal = {
      ...deal,
      bids: deal.bids.map((bid) => (bid.id === bidId ? { ...bid, bidStatus } : bid)),
      updatedAt: new Date().toISOString(),
    };
    this.deals.set(dealId, updated);
    return updated;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __stoaDealStore: DealStore | undefined;
}

export function getDealStore(): DealStore {
  if (!global.__stoaDealStore) {
    global.__stoaDealStore = new DealStore();
  }
  return global.__stoaDealStore;
}

export type { SeedSpec };
export { buildDeal };
