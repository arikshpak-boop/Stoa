import type { DDQualityAssessment } from "./dd-quality";

export type DealStatus = "Draft" | "Submitted" | "Analyzed" | "Closed";

export type BidStatus = "Pending" | "Accepted" | "Declined";

export type RiskLevel = "Low" | "Medium" | "High";

export type WarrantyCategory = "Fundamental" | "Operational";

export type Sector =
  | "SaaS / Technology"
  | "Manufacturing"
  | "Healthcare"
  | "Financial Services"
  | "Consumer & Retail"
  | "Energy & Natural Resources"
  | "Business Services";

export type WarrantyIdentifier =
  | "TITLE-01"
  | "CAP-01"
  | "CAPZ-01"
  | "FIN-01"
  | "TAX-01"
  | "IP-01"
  | "CONTR-01"
  | "EMPL-01"
  | "ENV-01";

export type RiskDomain =
  | "Legal & Corporate"
  | "Financial"
  | "Tax"
  | "IP & Technology"
  | "Commercial"
  | "Employment"
  | "Environmental";

export const RISK_DOMAINS: readonly RiskDomain[] = [
  "Legal & Corporate",
  "Financial",
  "Tax",
  "IP & Technology",
  "Commercial",
  "Employment",
  "Environmental",
];

export interface WarrantyDefinition {
  identifier: WarrantyIdentifier;
  category: WarrantyCategory;
  domain: RiskDomain;
  label: string;
  description: string;
}

export const WARRANTY_DEFINITIONS: readonly WarrantyDefinition[] = [
  { identifier: "TITLE-01", category: "Fundamental", domain: "Legal & Corporate", label: "Title", description: "Seller holds valid, unencumbered title to the shares or assets being transferred." },
  { identifier: "CAP-01", category: "Fundamental", domain: "Legal & Corporate", label: "Capacity", description: "Seller has full legal capacity and authority to enter into and perform the transaction documents." },
  { identifier: "CAPZ-01", category: "Fundamental", domain: "Legal & Corporate", label: "Capitalization", description: "The target's issued share capital is accurately stated, fully paid, and free of pre-emption rights." },
  { identifier: "FIN-01", category: "Operational", domain: "Financial", label: "Financial Statements", description: "Financial statements are accurate, complete, and prepared in accordance with applicable accounting standards." },
  { identifier: "TAX-01", category: "Operational", domain: "Tax", label: "Tax Compliance", description: "All tax returns filed and taxes paid; no outstanding disputes with tax authorities." },
  { identifier: "IP-01", category: "Operational", domain: "IP & Technology", label: "IP Ownership", description: "Target owns or validly licenses all intellectual property material to its business, free of infringement claims." },
  { identifier: "CONTR-01", category: "Operational", domain: "Commercial", label: "Material Contracts", description: "All material contracts are valid, in full force, and not subject to termination on change of control." },
  { identifier: "EMPL-01", category: "Operational", domain: "Employment", label: "Employment / Labor", description: "Compliance with employment law, no undisclosed labor disputes or change-of-control liabilities." },
  { identifier: "ENV-01", category: "Operational", domain: "Environmental", label: "Environmental Risk", description: "Compliance with environmental laws and permits; no undisclosed contamination or remediation liabilities." },
];

export interface DealTimeline {
  signingDate: string;
  scheduledClosingDate: string;
}

export interface DealTarget {
  companyName: string;
  jurisdiction: string;
  sector: Sector;
}

export interface DealFinancials {
  enterpriseValue: number;
  currency: string;
  targetDebt: number;
  targetCash: number;
}

export interface DealLegal {
  governingLaw: string;
  disputeResolutionVenue: string;
}

export interface ExtractedField<T> {
  value: T;
  confidence: number;
  sourceDocument: string;
  sourcePage: number;
  sourceCoordinates: { x: number; y: number; width: number; height: number };
}

export type DocumentClassification =
  | "spa-transaction-agreement"
  | "financial-statement"
  | "disclosure-schedule"
  | "org-document"
  | "correspondence"
  | "unclassifiable-irrelevant";

export interface DocumentClassificationOverride {
  classification: DocumentClassification;
  previousClassification: DocumentClassification;
  overriddenBy: string;
  overriddenAt: string;
}

export interface VdrDocument {
  id: string;
  fileName: string;
  fileType: "pdf" | "xlsx" | "docx";
  sizeBytes: number;
  uploadedAt: string;
  status: "Uploaded" | "Parsing" | "Parsed" | "Failed";
  classification: DocumentClassification;
  classificationConfidence: number;
  includedInAnalysis: boolean;
  classificationOverride?: DocumentClassificationOverride;
}

export interface DealWarranty {
  id: string;
  dealId: string;
  warrantyIdentifier: WarrantyIdentifier;
  severityScore: number;
  riskLevel: RiskLevel;
  complianceNotes: string;
  flagStatus: "Clear" | "Flagged" | "Under Review";
  missingDisclosures: string[];
}

export interface ExclusionClause {
  id: string;
  dealId: string;
  warrantyIdentifier: WarrantyIdentifier;
  title: string;
  draftText: string;
  triggeredBy: string;
  editable: boolean;
}

export interface Bid {
  id: string;
  dealId: string;
  carrierId: string;
  carrierName: string;
  limitAmount: number;
  limitPercentOfEv: number;
  retentionAmount: number;
  retentionTrigger: "Tipping" | "Erosion";
  rateOnLinePercent: number;
  premiumTotal: number;
  underwritingFees: number;
  expenseCap: number;
  policyExpiration: string;
  bidStatus: BidStatus;
  submittedAt: string;
  /**
   * Warranties the carrier requires excluded as a condition of this quote.
   * Optional because bids placed before carrier-specified exclusions existed
   * won't carry it. Resolve against the deal's exclusion report for wording.
   */
  requestedExclusions?: WarrantyIdentifier[];
  /** Underwriting contact, when the carrier has supplied one. */
  carrierContactEmail?: string;
}

/**
 * A Level-2 underwriting-call question: asked by a carrier when the
 * AI briefing (Level 1) can't answer from the data room alone, answered
 * by the deal maker on-platform, and then surfaced on the risk report.
 */
export interface UnderwritingOpenQuestion {
  id: string;
  dealId: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answer: string | null;
  answeredAt: string | null;
}

/** Which carriers on the panel a deal maker chose to present a deal to. */
export interface DealDistribution {
  carrierIds: string[];
  carrierNames: string[];
  selectedAt: string;
}

export interface Deal {
  id: string;
  organizationId: string;
  organizationName: string;
  status: DealStatus;
  target: DealTarget;
  financials: DealFinancials;
  legal: DealLegal;
  timeline: DealTimeline;
  documents: VdrDocument[];
  extractedFields: {
    companyName: ExtractedField<string>;
    jurisdiction: ExtractedField<string>;
    sector: ExtractedField<string>;
    enterpriseValue: ExtractedField<number>;
    targetDebt: ExtractedField<number>;
    targetCash: ExtractedField<number>;
    governingLaw: ExtractedField<string>;
    disputeResolutionVenue: ExtractedField<string>;
    signingDate: ExtractedField<string>;
    scheduledClosingDate: ExtractedField<string>;
  };
  warranties: DealWarranty[];
  exclusions: ExclusionClause[];
  bids: Bid[];
  /** Optional because deals persisted before the Underwriting Call feature won't carry it. */
  underwritingQuestions?: UnderwritingOpenQuestion[];
  /** Optional because deals submitted before carrier distribution won't carry it. */
  distribution?: DealDistribution;
  /** When the deal maker last re-solicited the panel for bids. */
  lastBidRequestAt?: string;
  ddQuality: DDQualityAssessment;
  version: number;
  snapshotHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealSnapshotInput {
  target: DealTarget;
  financials: DealFinancials;
  legal: DealLegal;
  timeline: DealTimeline;
  warranties: DealWarranty[];
  documentUris: string[];
}
