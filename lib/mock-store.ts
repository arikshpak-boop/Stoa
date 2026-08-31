import { randomUUID } from "crypto";
import { computeSnapshotHash } from "./hash";
import { calculateLimitPercentOfEv, calculatePremium } from "./premium";
import { computeWarrantyRiskProfile, generateExclusionReport } from "./risk-engine";
import { assessDataRoomQuality } from "./dd-quality";
import { classifyDocument, isIncludedInAnalysis } from "./document-classification";
import { redis, isRedisConfigured } from "./redis";
import { resolveCarrierNames } from "./carriers";
import type {
  Bid,
  Deal,
  DealFinancials,
  DealLegal,
  DealTarget,
  DealTimeline,
  DocumentClassification,
  ExtractedField,
  Sector,
  UnderwritingOpenQuestion,
  VdrDocument,
  WarrantyIdentifier,
} from "./types";

/**
 * Classifies and stamps a freshly-uploaded document. Shared by initial
 * submission (buildDeal) and later VDR additions (addDocuments) so every
 * entry point into the data room runs through the same P0-01 gate.
 */
export function createVdrDocument(input: { fileName: string; fileType: VdrDocument["fileType"]; sizeBytes: number }): VdrDocument {
  const { classification, confidence } = classifyDocument(input);
  return {
    id: randomUUID(),
    fileName: input.fileName,
    fileType: input.fileType,
    sizeBytes: input.sizeBytes,
    uploadedAt: new Date().toISOString(),
    status: "Parsed",
    classification,
    classificationConfidence: confidence,
    includedInAnalysis: isIncludedInAnalysis(classification),
  };
}

export type SeedSpecForTest = SeedSpec;

interface SeedSpec {
  organizationName: string;
  target: DealTarget;
  financials: DealFinancials;
  legal: DealLegal;
  timeline: DealTimeline;
  status: Deal["status"];
  documents: Array<{ fileName: string; fileType: VdrDocument["fileType"]; sizeBytes: number }>;
  missingDisclosuresByWarranty: Partial<Record<WarrantyIdentifier, string[]>>;
  distributionCarrierIds?: string[];
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
    requestedExclusions?: WarrantyIdentifier[];
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
  underwritingQuestions?: Array<{ question: string; askedBy: string; answer: string | null }>;
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

  const documents: VdrDocument[] = spec.documents.map((doc) => createVdrDocument(doc));
  const includedDocuments = documents.filter((doc) => doc.includedInAnalysis);

  const warranties = computeWarrantyRiskProfile(dealId, {
    sector: spec.target.sector,
    documentCount: includedDocuments.length,
    missingDisclosuresByWarranty: spec.missingDisclosuresByWarranty,
  });

  const exclusions = generateExclusionReport(dealId, warranties);

  const missingDisclosureCount = warranties.reduce((total, warranty) => total + warranty.missingDisclosures.length, 0);
  const confidenceValues = Object.values(confidence);
  const averageExtractionConfidence = confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length;

  const ddQuality = assessDataRoomQuality({
    documentCount: includedDocuments.length,
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
      requestedExclusions: bidSpec.requestedExclusions ?? [],
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
      companyName: field(spec.target.companyName, confidence.companyName, includedDocuments[0]?.fileName ?? "Submission package", 1),
      jurisdiction: field(spec.target.jurisdiction, confidence.jurisdiction, includedDocuments[0]?.fileName ?? "Submission package", 1),
      sector: field(spec.target.sector, confidence.sector, includedDocuments[0]?.fileName ?? "Submission package", 2),
      enterpriseValue: field(spec.financials.enterpriseValue, confidence.enterpriseValue, includedDocuments[0]?.fileName ?? "Submission package", 4),
      targetDebt: field(spec.financials.targetDebt, confidence.targetDebt, includedDocuments[1]?.fileName ?? includedDocuments[0]?.fileName ?? "Submission package", 1),
      targetCash: field(spec.financials.targetCash, confidence.targetCash, includedDocuments[1]?.fileName ?? includedDocuments[0]?.fileName ?? "Submission package", 1),
      governingLaw: field(spec.legal.governingLaw, confidence.governingLaw, includedDocuments[0]?.fileName ?? "Submission package", 42),
      disputeResolutionVenue: field(spec.legal.disputeResolutionVenue, confidence.disputeResolutionVenue, includedDocuments[0]?.fileName ?? "Submission package", 42),
      signingDate: field(spec.timeline.signingDate, confidence.signingDate, includedDocuments[0]?.fileName ?? "Submission package", 1),
      scheduledClosingDate: field(spec.timeline.scheduledClosingDate, confidence.scheduledClosingDate, includedDocuments[0]?.fileName ?? "Submission package", 1),
    },
    warranties,
    exclusions,
    bids,
    underwritingQuestions: (spec.underwritingQuestions ?? []).map((q) => ({
      id: randomUUID(),
      dealId,
      question: q.question,
      askedBy: q.askedBy,
      askedAt: now,
      answer: q.answer,
      answeredAt: q.answer === null ? null : now,
    })),
    distribution: spec.distributionCarrierIds?.length
      ? {
          carrierIds: spec.distributionCarrierIds,
          carrierNames: resolveCarrierNames(spec.distributionCarrierIds),
          selectedAt: now,
        }
      : undefined,
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
      { carrierName: "Euclid Transactional", limitAmount: 27_750_000, retentionAmount: 925_000, retentionTrigger: "Tipping", rateOnLinePercent: 2.8, underwritingFees: 45_000, expenseCap: 75_000, policyExpiration: "2033-08-15", bidStatus: "Pending", requestedExclusions: ["TAX-01", "ENV-01"] },
      { carrierName: "Berkshire Hathaway (BHSI)", limitAmount: 18_500_000, retentionAmount: 740_000, retentionTrigger: "Erosion", rateOnLinePercent: 3.1, underwritingFees: 38_000, expenseCap: 60_000, policyExpiration: "2033-08-15", bidStatus: "Pending", requestedExclusions: ["ENV-01", "EMPL-01", "CONTR-01"] },
    ],
    underwritingQuestions: [
      {
        question: "The open-source license audit is missing from the VDR. Can you confirm whether any copyleft (GPL/AGPL) components ship in the core product?",
        askedBy: "Euclid Transactional",
        answer: "Confirmed with the target's CTO: the core platform ships no GPL/AGPL components. Two AGPL tools are used internally for build tooling only and are not distributed. The completed license audit will be uploaded to the VDR this week.",
      },
      {
        question: "Which of the top-10 customer contracts contain change-of-control consent requirements, and have any consents been obtained pre-signing?",
        askedBy: "Berkshire Hathaway (BHSI)",
        answer: null,
      },
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
      { carrierName: "Mosaic Insurance", limitAmount: 13_800_000, retentionAmount: 460_000, retentionTrigger: "Tipping", rateOnLinePercent: 3.4, underwritingFees: 32_000, expenseCap: 55_000, policyExpiration: "2033-07-31", bidStatus: "Pending" },
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
      { carrierName: "Euclid Transactional", limitAmount: 91_500_000, retentionAmount: 3_050_000, retentionTrigger: "Tipping", rateOnLinePercent: 2.4, underwritingFees: 120_000, expenseCap: 180_000, policyExpiration: "2033-06-30", bidStatus: "Accepted", requestedExclusions: ["IP-01"] },
      { carrierName: "Berkshire Hathaway (BHSI)", limitAmount: 61_000_000, retentionAmount: 2_400_000, retentionTrigger: "Erosion", rateOnLinePercent: 2.7, underwritingFees: 98_000, expenseCap: 150_000, policyExpiration: "2033-06-30", bidStatus: "Declined", requestedExclusions: ["IP-01", "TAX-01", "FIN-01"] },
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

interface DealStore {
  list(): Promise<Deal[]>;
  get(dealId: string): Promise<Deal | undefined>;
  create(spec: SeedSpec): Promise<Deal>;
  addBid(dealId: string, bid: Bid): Promise<Deal | undefined>;
  updateBidStatus(dealId: string, bidId: string, bidStatus: Bid["bidStatus"]): Promise<Deal | undefined>;
  acceptBid(dealId: string, bidId: string): Promise<Deal | undefined>;
  addUnderwritingQuestion(dealId: string, question: UnderwritingOpenQuestion): Promise<Deal | undefined>;
  answerUnderwritingQuestion(dealId: string, questionId: string, answer: string): Promise<Deal | undefined>;
  updateDealStatus(dealId: string, status: Deal["status"]): Promise<Deal | undefined>;
  recordBidRequest(dealId: string): Promise<Deal | undefined>;
  addDocuments(dealId: string, documents: VdrDocument[]): Promise<Deal | undefined>;
  overrideDocumentClassification(
    dealId: string,
    documentId: string,
    classification: DocumentClassification,
    overriddenBy: string,
  ): Promise<Deal | undefined>;
}

function applyStatusUpdate(deal: Deal, status: Deal["status"]): Deal {
  return { ...deal, status, updatedAt: new Date().toISOString() };
}

function applyDocumentAdd(deal: Deal, documents: VdrDocument[]): Deal {
  return { ...deal, documents: [...deal.documents, ...documents], updatedAt: new Date().toISOString() };
}

function applyClassificationOverride(
  deal: Deal,
  documentId: string,
  classification: DocumentClassification,
  overriddenBy: string,
): Deal | undefined {
  if (!deal.documents.some((doc) => doc.id === documentId)) return undefined;
  const now = new Date().toISOString();
  return {
    ...deal,
    documents: deal.documents.map((doc) => {
      if (doc.id !== documentId) return doc;
      return {
        ...doc,
        classification,
        includedInAnalysis: isIncludedInAnalysis(classification),
        classificationOverride: {
          classification,
          previousClassification: doc.classification,
          overriddenBy,
          overriddenAt: now,
        },
      };
    }),
    updatedAt: now,
  };
}

function applyQuestionAdd(deal: Deal, question: UnderwritingOpenQuestion): Deal {
  return {
    ...deal,
    underwritingQuestions: [...(deal.underwritingQuestions ?? []), question],
    updatedAt: new Date().toISOString(),
  };
}

function applyQuestionAnswer(deal: Deal, questionId: string, answer: string): Deal {
  return {
    ...deal,
    underwritingQuestions: (deal.underwritingQuestions ?? []).map((q) =>
      q.id === questionId ? { ...q, answer, answeredAt: new Date().toISOString() } : q,
    ),
    updatedAt: new Date().toISOString(),
  };
}

function applyBidAcceptance(deal: Deal, bidId: string): Deal {
  return {
    ...deal,
    status: "Closed",
    bids: deal.bids.map((bid) => {
      if (bid.id === bidId) return { ...bid, bidStatus: "Accepted" };
      return bid.bidStatus === "Pending" ? { ...bid, bidStatus: "Declined" } : bid;
    }),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Used when no Redis is configured (e.g. local dev with no env vars set).
 * Data lives only in this process's memory — fine for a single long-running
 * `next dev` process, but does not survive across Vercel's serverless
 * function instances, which is exactly why the Redis-backed store below
 * exists for production.
 */
class InMemoryDealStore implements DealStore {
  private deals: Map<string, Deal> = new Map();

  constructor() {
    for (const spec of SEED_SPECS) {
      const deal = buildDeal(spec);
      this.deals.set(deal.id, deal);
    }
  }

  async list(): Promise<Deal[]> {
    return Array.from(this.deals.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async get(dealId: string): Promise<Deal | undefined> {
    return this.deals.get(dealId);
  }

  async create(spec: SeedSpec): Promise<Deal> {
    const deal = buildDeal(spec);
    this.deals.set(deal.id, deal);
    return deal;
  }

  async addBid(dealId: string, bid: Bid): Promise<Deal | undefined> {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const updated: Deal = { ...deal, bids: [...deal.bids, bid], updatedAt: new Date().toISOString() };
    this.deals.set(dealId, updated);
    return updated;
  }

  async updateBidStatus(dealId: string, bidId: string, bidStatus: Bid["bidStatus"]): Promise<Deal | undefined> {
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

  async acceptBid(dealId: string, bidId: string): Promise<Deal | undefined> {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const updated = applyBidAcceptance(deal, bidId);
    this.deals.set(dealId, updated);
    return updated;
  }

  async addUnderwritingQuestion(dealId: string, question: UnderwritingOpenQuestion): Promise<Deal | undefined> {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const updated = applyQuestionAdd(deal, question);
    this.deals.set(dealId, updated);
    return updated;
  }

  async answerUnderwritingQuestion(dealId: string, questionId: string, answer: string): Promise<Deal | undefined> {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const updated = applyQuestionAnswer(deal, questionId, answer);
    this.deals.set(dealId, updated);
    return updated;
  }

  async updateDealStatus(dealId: string, status: Deal["status"]): Promise<Deal | undefined> {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const updated = applyStatusUpdate(deal, status);
    this.deals.set(dealId, updated);
    return updated;
  }

  async recordBidRequest(dealId: string): Promise<Deal | undefined> {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const now = new Date().toISOString();
    const updated: Deal = { ...deal, lastBidRequestAt: now, updatedAt: now };
    this.deals.set(dealId, updated);
    return updated;
  }

  async addDocuments(dealId: string, documents: VdrDocument[]): Promise<Deal | undefined> {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const updated = applyDocumentAdd(deal, documents);
    this.deals.set(dealId, updated);
    return updated;
  }

  async overrideDocumentClassification(
    dealId: string,
    documentId: string,
    classification: DocumentClassification,
    overriddenBy: string,
  ): Promise<Deal | undefined> {
    const deal = this.deals.get(dealId);
    if (!deal) return undefined;
    const updated = applyClassificationOverride(deal, documentId, classification, overriddenBy);
    if (!updated) return undefined;
    this.deals.set(dealId, updated);
    return updated;
  }
}

const DEALS_INDEX_KEY = "stoa:deals:index";
const SEED_LOCK_KEY = "stoa:seed:lock";
const dealKey = (dealId: string) => `stoa:deal:${dealId}`;

/**
 * Persists to Upstash Redis so deals, bids, and signups survive across
 * Vercel's independent serverless function instances. Seeds are inserted
 * exactly once — guarded by a short-lived lock so two cold starts racing
 * on first request don't double-seed.
 */
class RedisDealStore implements DealStore {
  private seeded = false;

  private async ensureSeeded(): Promise<void> {
    if (this.seeded || !redis) return;

    const existingCount = await redis.scard(DEALS_INDEX_KEY);
    if (existingCount > 0) {
      this.seeded = true;
      return;
    }

    const acquiredLock = await redis.set(SEED_LOCK_KEY, "1", { nx: true, ex: 30 });
    if (!acquiredLock) {
      this.seeded = true;
      return;
    }

    const pipeline = redis.pipeline();
    for (const spec of SEED_SPECS) {
      const deal = buildDeal(spec);
      pipeline.set(dealKey(deal.id), deal);
      pipeline.sadd(DEALS_INDEX_KEY, deal.id);
    }
    await pipeline.exec();
    this.seeded = true;
  }

  async list(): Promise<Deal[]> {
    await this.ensureSeeded();
    const ids = await redis!.smembers(DEALS_INDEX_KEY);
    if (ids.length === 0) return [];
    const deals = await Promise.all(ids.map((id) => redis!.get<Deal>(dealKey(id))));
    return deals
      .filter((deal): deal is Deal => deal !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async get(dealId: string): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await redis!.get<Deal>(dealKey(dealId));
    return deal ?? undefined;
  }

  async create(spec: SeedSpec): Promise<Deal> {
    await this.ensureSeeded();
    const deal = buildDeal(spec);
    await redis!.set(dealKey(deal.id), deal);
    await redis!.sadd(DEALS_INDEX_KEY, deal.id);
    return deal;
  }

  async addBid(dealId: string, bid: Bid): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await this.get(dealId);
    if (!deal) return undefined;
    const updated: Deal = { ...deal, bids: [...deal.bids, bid], updatedAt: new Date().toISOString() };
    await redis!.set(dealKey(dealId), updated);
    return updated;
  }

  async updateBidStatus(dealId: string, bidId: string, bidStatus: Bid["bidStatus"]): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await this.get(dealId);
    if (!deal) return undefined;
    const updated: Deal = {
      ...deal,
      bids: deal.bids.map((b) => (b.id === bidId ? { ...b, bidStatus } : b)),
      updatedAt: new Date().toISOString(),
    };
    await redis!.set(dealKey(dealId), updated);
    return updated;
  }

  async acceptBid(dealId: string, bidId: string): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await this.get(dealId);
    if (!deal) return undefined;
    const updated = applyBidAcceptance(deal, bidId);
    await redis!.set(dealKey(dealId), updated);
    return updated;
  }

  async addUnderwritingQuestion(dealId: string, question: UnderwritingOpenQuestion): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await this.get(dealId);
    if (!deal) return undefined;
    const updated = applyQuestionAdd(deal, question);
    await redis!.set(dealKey(dealId), updated);
    return updated;
  }

  async answerUnderwritingQuestion(dealId: string, questionId: string, answer: string): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await this.get(dealId);
    if (!deal) return undefined;
    const updated = applyQuestionAnswer(deal, questionId, answer);
    await redis!.set(dealKey(dealId), updated);
    return updated;
  }

  async updateDealStatus(dealId: string, status: Deal["status"]): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await this.get(dealId);
    if (!deal) return undefined;
    const updated = applyStatusUpdate(deal, status);
    await redis!.set(dealKey(dealId), updated);
    return updated;
  }

  async recordBidRequest(dealId: string): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await this.get(dealId);
    if (!deal) return undefined;
    const now = new Date().toISOString();
    const updated: Deal = { ...deal, lastBidRequestAt: now, updatedAt: now };
    await redis!.set(dealKey(dealId), updated);
    return updated;
  }

  async addDocuments(dealId: string, documents: VdrDocument[]): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await this.get(dealId);
    if (!deal) return undefined;
    const updated = applyDocumentAdd(deal, documents);
    await redis!.set(dealKey(dealId), updated);
    return updated;
  }

  async overrideDocumentClassification(
    dealId: string,
    documentId: string,
    classification: DocumentClassification,
    overriddenBy: string,
  ): Promise<Deal | undefined> {
    await this.ensureSeeded();
    const deal = await this.get(dealId);
    if (!deal) return undefined;
    const updated = applyClassificationOverride(deal, documentId, classification, overriddenBy);
    if (!updated) return undefined;
    await redis!.set(dealKey(dealId), updated);
    return updated;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __stoaDealStore: DealStore | undefined;
}

export function getDealStore(): DealStore {
  if (!global.__stoaDealStore) {
    global.__stoaDealStore = isRedisConfigured ? new RedisDealStore() : new InMemoryDealStore();
  }
  return global.__stoaDealStore;
}

export type { SeedSpec, DealStore };
export { buildDeal };
