import type { DocumentClassification } from "./types";

export interface DocumentClassificationInput {
  fileName: string;
  fileType: "pdf" | "xlsx" | "docx";
}

export interface DocumentClassificationResult {
  classification: DocumentClassification;
  confidence: number;
}

/**
 * Ordered filename-keyword rules standing in for the real content-based
 * classifier described in P0-01. Each bucket lists substrings matched
 * against the lower-cased, underscore-normalized filename; the first
 * matching bucket wins. Anything matching nothing falls through to
 * "unclassifiable-irrelevant" — a closed allowlist rather than a denylist,
 * so novel irrelevant filenames (an invoice, an itinerary, a personal
 * employment contract) are excluded by default instead of requiring the
 * classifier to have anticipated every irrelevant pattern in advance.
 */
const CLASSIFICATION_RULES: ReadonlyArray<{ classification: DocumentClassification; keywords: string[]; confidence: number }> = [
  {
    classification: "spa-transaction-agreement",
    keywords: ["spa", "share_purchase", "asset_purchase", "purchase_agreement", "merger_agreement", "loi", "letter_of_intent", "transaction_agreement"],
    confidence: 0.96,
  },
  {
    classification: "financial-statement",
    keywords: ["financial", "balance_sheet", "income_statement", "profit_and_loss", "p&l", "reserve_report", "audited_accounts", "qoe", "quality_of_earnings"],
    confidence: 0.93,
  },
  {
    classification: "disclosure-schedule",
    keywords: ["disclosure", "schedule"],
    confidence: 0.92,
  },
  {
    classification: "org-document",
    keywords: ["certificate_of_incorporation", "articles_of_incorporation", "bylaws", "cap_table", "capitalization_table", "org_chart", "good_standing", "shareholder_register"],
    confidence: 0.9,
  },
  {
    classification: "correspondence",
    keywords: ["correspondence", "email", "letter_from", "memo"],
    confidence: 0.85,
  },
];

function normalize(fileName: string): string {
  return fileName.toLowerCase().replace(/[\s\-]+/g, "_");
}

export function classifyDocument(doc: DocumentClassificationInput): DocumentClassificationResult {
  const normalized = normalize(doc.fileName);

  for (const rule of CLASSIFICATION_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return { classification: rule.classification, confidence: rule.confidence };
    }
  }

  return { classification: "unclassifiable-irrelevant", confidence: 0.8 };
}

export function isIncludedInAnalysis(classification: DocumentClassification): boolean {
  return classification !== "unclassifiable-irrelevant";
}

export const DOCUMENT_CLASSIFICATION_LABELS: Record<DocumentClassification, string> = {
  "spa-transaction-agreement": "Transaction Agreement",
  "financial-statement": "Financial Statement",
  "disclosure-schedule": "Disclosure Schedule",
  "org-document": "Org Document",
  correspondence: "Correspondence",
  "unclassifiable-irrelevant": "Unrecognized",
};
