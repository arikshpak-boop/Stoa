/**
 * What carriers expect to see in a W&I submission, and what they look for in
 * each document. Surfaced during ingestion so a deal maker can tell whether a
 * package is placement-ready before it reaches the panel.
 *
 * `keywords` drive a filename match. It is a heuristic on names alone — the
 * point is a nudge about what is missing, not a claim about file contents.
 */

export interface ChecklistDocument {
  id: string;
  name: string;
  /** What the carrier is actually reading this document for. */
  focus: string;
  keywords: string[];
}

export interface ChecklistCategory {
  category: string;
  documents: ChecklistDocument[];
}

export const PLACEMENT_CHECKLIST: readonly ChecklistCategory[] = [
  {
    category: "Transaction",
    documents: [
      { id: "spa", name: "Final/Near-Final SPA", focus: "Warranty suite, disclosure mechanics, and indemnity caps.", keywords: ["spa", "share purchase", "purchase agreement", "apa", "asset purchase", "sale and purchase"] },
      { id: "disclosure-letter", name: "Disclosure Letter & Schedules", focus: "Known issues that will be carved out of the policy.", keywords: ["disclosure"] },
      { id: "cim", name: "CIM / Investor Presentation", focus: "Historical narrative and management's view of growth.", keywords: ["cim", "investor", "information memorandum", "teaser", "management presentation"] },
    ],
  },
  {
    category: "Financial",
    documents: [
      { id: "qoe", name: "Quality of Earnings (QoE)", focus: "Adjustments to EBITDA, cash flow, and revenue recognition.", keywords: ["qoe", "quality of earnings"] },
      { id: "net-debt-wc", name: "Net Debt & Working Capital", focus: 'Verification of "locked-box" or closing accounts.', keywords: ["net debt", "working capital", "locked box", "locked-box", "closing accounts"] },
      { id: "audited-financials", name: "Audited Financials (3 Years)", focus: "Historical consistency and auditor's opinions.", keywords: ["audited", "financial statement", "annual report", "financials", "balance sheet"] },
    ],
  },
  {
    category: "Tax",
    documents: [
      { id: "tax-dd", name: "Technical Tax DD Report", focus: "Corporate income tax, nexus, and historic audits.", keywords: ["tax dd", "tax due diligence", "tax report", "tax memo"] },
      { id: "transfer-pricing", name: "Transfer Pricing Study", focus: "Intercompany pricing compliance (crucial for cross-border).", keywords: ["transfer pricing"] },
      { id: "sales-use-tax", name: "Sales & Use Tax Review", focus: "State and local tax exposures (high claim area).", keywords: ["sales tax", "use tax", "salt", "sales & use"] },
    ],
  },
  {
    category: "Legal",
    documents: [
      { id: "legal-dd", name: "Legal DD Report", focus: "Title to shares, material contracts, and corporate authority.", keywords: ["legal dd", "legal due diligence", "legal report"] },
      { id: "litigation-schedule", name: "Litigation Schedule", focus: "Summary of all active, threatened, or settled claims.", keywords: ["litigation", "dispute", "claims schedule"] },
      { id: "ip-chain-of-title", name: "IP Chain of Title", focus: "Proof that the company owns its software/patents.", keywords: ["ip chain", "chain of title", "intellectual property", "patent", "trademark", "ip assignment"] },
    ],
  },
  {
    category: "Human Resources",
    documents: [
      { id: "hr-dd", name: "HR / Employment DD Report", focus: "Employee vs. Contractor classification (Wage & Hour).", keywords: ["hr dd", "employment", "hr due diligence", "workforce"] },
      { id: "pension-benefits", name: "Pension / Benefits Report", focus: "Unfunded liabilities and 401(k)/ERISA compliance.", keywords: ["pension", "benefits", "401k", "401(k)", "erisa"] },
      { id: "management-rollover", name: "Management Equity Rollover", focus: 'Details on who is staying and their "skin in the game."', keywords: ["rollover", "management equity", "mep", "incentive plan"] },
    ],
  },
  {
    category: "Operational",
    documents: [
      { id: "cyber-it-dd", name: "Cyber / IT DD Report", focus: "Security protocols, penetration test results, and GDPR.", keywords: ["cyber", "it dd", "penetration", "pen test", "gdpr", "infosec"] },
      { id: "environmental-phase-i", name: "Environmental (Phase I)", focus: "Ground contamination and hazardous material logs.", keywords: ["environmental", "phase i", "phase 1", "esa", "contamination"] },
      { id: "insurance-gap", name: "Insurance Gap Analysis", focus: "Comparison of target's current tower vs. future needs.", keywords: ["insurance gap", "insurance tower", "insurance review", "coverage review"] },
    ],
  },
  {
    category: "Closing Documents",
    documents: [
      { id: "ncd", name: "No Claims Declaration (NCD)", focus: "Formal statement that Buyer is unaware of any breaches.", keywords: ["no claims", "ncd", "no-claims"] },
      { id: "nrl", name: "Non-Reliance Letters (NRLs)", focus: "Permission for carrier to read third-party advisor reports.", keywords: ["non-reliance", "nonreliance", "reliance letter", "nrl"] },
    ],
  },
];

export const CHECKLIST_DOCUMENT_COUNT = PLACEMENT_CHECKLIST.reduce(
  (total, group) => total + group.documents.length,
  0,
);

/** Ids of checklist documents a filename plausibly satisfies. */
export function matchChecklistIds(fileNames: readonly string[]): Set<string> {
  const haystacks = fileNames.map((name) => name.toLowerCase());
  const matched = new Set<string>();

  for (const group of PLACEMENT_CHECKLIST) {
    for (const document of group.documents) {
      if (document.keywords.some((keyword) => haystacks.some((name) => name.includes(keyword)))) {
        matched.add(document.id);
      }
    }
  }

  return matched;
}
