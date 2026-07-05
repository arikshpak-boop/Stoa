import type { Sector, WarrantyIdentifier } from "./types";

/**
 * Deterministic mulberry32 PRNG so repeated extractions against the same
 * company name produce stable mock output instead of flickering on refresh.
 */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const JURISDICTION_LEGAL_MAP: Record<string, { governingLaw: string; disputeResolutionVenue: string }> = {
  "Delaware, USA": { governingLaw: "State of Delaware", disputeResolutionVenue: "AAA Arbitration, New York" },
  "New York, USA": { governingLaw: "State of New York", disputeResolutionVenue: "ICC Arbitration, New York" },
  "California, USA": { governingLaw: "State of California", disputeResolutionVenue: "JAMS Arbitration, San Francisco" },
  "England & Wales": { governingLaw: "England & Wales", disputeResolutionVenue: "LCIA Arbitration, London" },
  "Scotland, UK": { governingLaw: "Scotland", disputeResolutionVenue: "LCIA Arbitration, London" },
  "Ontario, Canada": { governingLaw: "Province of Ontario", disputeResolutionVenue: "ADR Chambers, Toronto" },
  "Singapore": { governingLaw: "Republic of Singapore", disputeResolutionVenue: "SIAC Arbitration, Singapore" },
};

const SECTOR_MISSING_DISCLOSURE_POOL: Record<Sector, Partial<Record<WarrantyIdentifier, string[]>>> = {
  "SaaS / Technology": {
    "IP-01": ["Open-source license audit", "Source code escrow agreement", "Patent assignment register"],
    "CONTR-01": ["Top-10 customer contract change-of-control clauses", "SaaS SLA penalty schedule"],
  },
  "Manufacturing": {
    "ENV-01": ["Phase II remediation cost estimate", "Historical landfill usage records", "Air emissions permit renewals"],
    "EMPL-01": ["Works council consultation minutes", "Union collective bargaining agreements"],
  },
  "Healthcare": {
    "TAX-01": ["State tax nexus study"],
    "CONTR-01": ["Payor contract renegotiation clauses", "Group purchasing organization agreements"],
    "EMPL-01": ["Physician non-compete enforceability memo"],
  },
  "Financial Services": {
    "TAX-01": ["Transfer pricing documentation", "Withholding tax certificates"],
    "CAPZ-01": ["Regulatory capital adequacy confirmation"],
  },
  "Consumer & Retail": {
    "CONTR-01": ["Store lease change-of-control provisions", "Franchise agreement termination clauses"],
    "EMPL-01": ["Wage and hour class action review"],
  },
  "Energy & Natural Resources": {
    "ENV-01": ["Decommissioning liability estimate", "Emissions trading scheme compliance record"],
    "CONTR-01": ["Offtake agreement price renegotiation clauses"],
  },
  "Business Services": {
    "EMPL-01": ["Contractor misclassification review"],
    "CONTR-01": ["Master services agreement termination-for-convenience clauses"],
  },
};

export interface ExtractionRequestPayload {
  organizationName: string;
  companyName: string;
  jurisdiction: string;
  sector: Sector;
  documents: Array<{ fileName: string; fileType: "pdf" | "xlsx" | "docx"; sizeBytes: number }>;
}

export interface MockExtractionResult {
  enterpriseValue: number;
  currency: string;
  targetDebt: number;
  targetCash: number;
  governingLaw: string;
  disputeResolutionVenue: string;
  signingDate: string;
  scheduledClosingDate: string;
  missingDisclosuresByWarranty: Partial<Record<WarrantyIdentifier, string[]>>;
  fieldConfidence: {
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

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function runMockExtraction(payload: ExtractionRequestPayload): MockExtractionResult {
  const rng = seededRandom(`${payload.companyName}::${payload.jurisdiction}::${payload.sector}`);

  // The platform quotes all transactions in USD regardless of the target's
  // jurisdiction, so brokers and carriers always compare like for like.
  const currency = "USD";

  const enterpriseValue = Math.round((25_000_000 + rng() * 575_000_000) / 500_000) * 500_000;
  const targetDebt = Math.round(enterpriseValue * (0.05 + rng() * 0.25));
  const targetCash = Math.round(enterpriseValue * (0.02 + rng() * 0.12));

  const legalDefaults = JURISDICTION_LEGAL_MAP[payload.jurisdiction] ?? {
    governingLaw: payload.jurisdiction,
    disputeResolutionVenue: "ICC Arbitration, Paris",
  };

  const today = new Date().toISOString().slice(0, 10);
  const signingDate = addDays(today, Math.floor(rng() * 10) - 5);
  const scheduledClosingDate = addDays(signingDate, 45 + Math.floor(rng() * 45));

  const sectorPool = SECTOR_MISSING_DISCLOSURE_POOL[payload.sector];
  const missingDisclosuresByWarranty: Partial<Record<WarrantyIdentifier, string[]>> = {};
  const hasMinimalDocuments = payload.documents.length < 2;

  for (const [identifier, disclosures] of Object.entries(sectorPool) as Array<[WarrantyIdentifier, string[]]>) {
    const shouldFlag = hasMinimalDocuments || rng() > 0.45;
    if (shouldFlag) {
      const count = hasMinimalDocuments ? disclosures.length : 1 + Math.floor(rng() * disclosures.length);
      missingDisclosuresByWarranty[identifier] = disclosures.slice(0, count);
    }
  }

  return {
    enterpriseValue,
    currency,
    targetDebt,
    targetCash,
    governingLaw: legalDefaults.governingLaw,
    disputeResolutionVenue: legalDefaults.disputeResolutionVenue,
    signingDate,
    scheduledClosingDate,
    missingDisclosuresByWarranty,
    fieldConfidence: {
      companyName: 0.99,
      jurisdiction: 0.95,
      sector: 0.9,
      enterpriseValue: hasMinimalDocuments ? 0.62 : 0.94,
      targetDebt: hasMinimalDocuments ? 0.55 : 0.9,
      targetCash: hasMinimalDocuments ? 0.55 : 0.9,
      governingLaw: 0.97,
      disputeResolutionVenue: 0.92,
      signingDate: 0.98,
      scheduledClosingDate: hasMinimalDocuments ? 0.7 : 0.88,
    },
  };
}
