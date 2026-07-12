import { formatCurrency } from "./premium";
import { mockContactName, mockIndexForId } from "./kpi";
import { WARRANTY_DEFINITIONS, type Deal, type DealWarranty, type Sector, type WarrantyIdentifier } from "./types";

/**
 * Level 1 of the Underwriting Call: the 25 standard questions every W&I
 * underwriter asks, pre-answered by the platform from the locked submission
 * package (deal terms, VDR contents, warranty risk profile, disclosure
 * gaps). Answers are deterministic functions of deal data — same deal,
 * same briefing — so the "AI analysis" stays stable across reloads.
 *
 * Questions whose underlying risk domain is flagged in the warranty matrix
 * come back as "Refer to Deal Maker" instead of a confident answer; those
 * are exactly the ones a carrier should escalate to Level 2 (open
 * questions answered by the deal maker on-platform).
 */

export type UnderwritingCategory =
  | "Strategy & Deal"
  | "Financials"
  | "Tax Risk"
  | "Legal & Ops"
  | "Employment"
  | "Compliance"
  | "Diligence Quality";

export const UNDERWRITING_CATEGORIES: readonly UnderwritingCategory[] = [
  "Strategy & Deal",
  "Financials",
  "Tax Risk",
  "Legal & Ops",
  "Employment",
  "Compliance",
  "Diligence Quality",
];

export interface UnderwritingBriefingItem {
  number: number;
  category: UnderwritingCategory;
  question: string;
  purpose: string;
  answer: string;
  source: string;
  status: "Verified" | "Refer to Deal Maker";
}

const RATIONALE_BY_SECTOR: Record<Sector, string> = {
  "SaaS / Technology": "recurring-revenue expansion and product cross-sell into the buyer's installed base",
  "Manufacturing": "capacity consolidation and supply-chain synergies with the buyer's existing plants",
  "Healthcare": "regional network density and payor-mix diversification",
  "Financial Services": "fee-income diversification and balance-sheet-light growth",
  "Consumer & Retail": "brand portfolio expansion and omnichannel distribution reach",
  "Energy & Natural Resources": "reserve-base expansion and infrastructure adjacency",
  "Business Services": "client-base consolidation and operating-margin uplift",
};

const CYBER_BY_SECTOR: Record<Sector, string> = {
  "SaaS / Technology": "SOC 2 Type II report current; last external penetration test findings remediated and re-tested.",
  "Manufacturing": "OT/IT segmentation in place; cyber program at a moderate maturity with a 12-month remediation roadmap.",
  "Healthcare": "HIPAA risk assessment current; PHI access logging and encryption verified.",
  "Financial Services": "Regulator-aligned information-security program; annual independent audit with no critical findings.",
  "Consumer & Retail": "PCI-DSS attestation current for card environments; e-commerce platform on managed infrastructure.",
  "Energy & Natural Resources": "NERC-style controls on operational systems; corporate IT at moderate maturity.",
  "Business Services": "ISO 27001-aligned controls; client-data segregation verified on a sample basis.",
};

const EBITDA_MULTIPLE_CYCLE = [8.5, 10.2, 11.4, 9.1, 12.6];
const PROCESS_CYCLE = [
  "a limited auction with two other financial sponsors at the final stage",
  "a bilateral negotiation following an unsolicited approach by the buyer",
  "a broad auction run by the sell-side advisor with staged data room access",
  "a bilateral process with exclusivity granted after the first indicative offer",
];
const ROLLOVER_CYCLE = [15, 25, 0, 40, 10];
const RENEWAL_CYCLE = [
  "All top-5 customer contracts run beyond the next 18 months; no renewal falls inside the 6-month window.",
  "One top-5 customer renews within the window — flagged for a revenue-continuity representation.",
  "Top-5 contracts are evergreen with 12-month notice periods; none in active renegotiation.",
];
const PENSION_CYCLE = [
  "No defined-benefit schemes; retirement provision is defined-contribution only.",
  "A legacy defined-benefit scheme is closed to new members and fully funded on the latest actuarial valuation.",
];

function warrantyFor(deal: Deal, identifier: WarrantyIdentifier): DealWarranty | undefined {
  return deal.warranties.find((w) => w.warrantyIdentifier === identifier);
}

function isFlagged(warranty: DealWarranty | undefined): boolean {
  return !!warranty && (warranty.missingDisclosures.length > 0 || warranty.riskLevel === "High");
}

function documentSource(deal: Deal, offset: number): string {
  if (deal.documents.length === 0) return "Submission package";
  const doc = deal.documents[offset % deal.documents.length]!;
  return doc.fileName;
}

function referral(gapSummary: string): { answer: string; source: string; status: "Refer to Deal Maker" } {
  return {
    answer: `The data room does not support a confident answer: ${gapSummary} Submit this as an open question below — the deal maker's on-platform response is appended to the risk report.`,
    source: "Deal maker input required",
    status: "Refer to Deal Maker",
  };
}

export function generateUnderwritingBriefing(deal: Deal): UnderwritingBriefingItem[] {
  const index = mockIndexForId(deal.id);
  const name = deal.target.companyName;
  const sector = deal.target.sector;
  const currency = deal.financials.currency;
  const ev = formatCurrency(deal.financials.enterpriseValue, currency);
  const multiple = EBITDA_MULTIPLE_CYCLE[index % EBITDA_MULTIPLE_CYCLE.length]!;
  const process = PROCESS_CYCLE[index % PROCESS_CYCLE.length]!;
  const rollover = ROLLOVER_CYCLE[index % ROLLOVER_CYCLE.length]!;
  const isAuction = process.includes("auction");

  const fin = warrantyFor(deal, "FIN-01");
  const tax = warrantyFor(deal, "TAX-01");
  const ip = warrantyFor(deal, "IP-01");
  const contr = warrantyFor(deal, "CONTR-01");
  const empl = warrantyFor(deal, "EMPL-01");
  const env = warrantyFor(deal, "ENV-01");

  const highestSeverity = [...deal.warranties].sort((a, b) => b.severityScore - a.severityScore)[0];
  const highestLabel = highestSeverity
    ? WARRANTY_DEFINITIONS.find((d) => d.identifier === highestSeverity.warrantyIdentifier)?.label ?? "n/a"
    : "n/a";

  const verified = (answer: string, source: string): Pick<UnderwritingBriefingItem, "answer" | "source" | "status"> => ({
    answer,
    source,
    status: "Verified",
  });

  const items: Array<Omit<UnderwritingBriefingItem, "number">> = [
    // Strategy & Deal
    {
      category: "Strategy & Deal",
      question: "What is the commercial rationale for the acquisition?",
      purpose: "To see if the buyer is overpaying or \"buying trouble.\"",
      ...verified(
        `${name} gives the buyer an established ${sector} platform in ${deal.target.jurisdiction}; the investment thesis centers on ${RATIONALE_BY_SECTOR[sector]}.`,
        documentSource(deal, 0),
      ),
    },
    {
      category: "Strategy & Deal",
      question: "How was the purchase price/multiple determined?",
      purpose: "To ensure the valuation isn't based on aggressive projections.",
      ...verified(
        `Enterprise value of ${ev} implies roughly ${multiple}x adjusted EBITDA, benchmarked against recent comparable ${sector} transactions rather than management projections.`,
        documentSource(deal, 1),
      ),
    },
    {
      category: "Strategy & Deal",
      question: "Was this an auction or a bilateral process?",
      purpose: "Auctions often imply rushed/shallow diligence.",
      ...verified(
        `The transaction ran as ${process}.${isAuction ? " The compressed auction timeline was mitigated by targeted confirmatory diligence after exclusivity." : ""}`,
        documentSource(deal, 2),
      ),
    },
    {
      category: "Strategy & Deal",
      question: "Which management members are rolling over equity?",
      purpose: "\"Skin in the game\" reduces the risk of seller fraud.",
      ...(rollover === 0
        ? referral("no equity rollover is documented and the founders appear to be exiting fully, which raises seller-fraud sensitivity.")
        : verified(
            `Senior management rolls over approximately ${rollover}% of proceeds into the acquiring structure, aligning incentives through the warranty period.`,
            documentSource(deal, 3),
          )),
    },
    {
      category: "Strategy & Deal",
      question: "Who is the \"Knowledge Group\" for the Buyer?",
      purpose: "Defining exactly whose knowledge can trigger an exclusion.",
      ...verified(
        `The knowledge group is defined as the deal captain (${mockContactName(index)}), the buyer's CFO, and lead counsel at ${deal.organizationName} — actual knowledge only, no imputed knowledge.`,
        documentSource(deal, 4),
      ),
    },
    // Financials
    {
      category: "Financials",
      question: "Was the Quality of Earnings (QoE) \"Full Scope\"?",
      purpose: "To check if any subsidiaries or units were skipped.",
      ...(isFlagged(fin)
        ? referral(`the financial-statements warranty is flagged (${fin?.missingDisclosures.join("; ") || "elevated risk score"}), so QoE scope completeness cannot be confirmed from the VDR.`)
        : verified(
            `Full-scope QoE covering all operating entities; no subsidiaries were carved out of the review perimeter.`,
            documentSource(deal, 5),
          )),
    },
    {
      category: "Financials",
      question: "Any significant \"audit adjustments\" in the last 2 years?",
      purpose: "To find hidden accounting irregularities or \"fluff.\"",
      ...(isFlagged(fin)
        ? referral("audit-adjustment history cannot be verified while the financial-statements warranty carries open disclosure gaps.")
        : verified(
            "No material audit adjustments in the last two fiscal years; the auditor issued unqualified opinions in both periods.",
            documentSource(deal, 6),
          )),
    },
    {
      category: "Financials",
      question: "How does the Target manage its working capital?",
      purpose: "To prevent claims related to \"inventory stuffing\" or bad debt.",
      ...verified(
        `The target runs on ${formatCurrency(deal.financials.targetCash, currency)} of cash against ${formatCurrency(deal.financials.targetDebt, currency)} gross debt; the NWC peg is set off a trailing 12-month average with no unusual seasonality flags.`,
        documentSource(deal, 7),
      ),
    },
    {
      category: "Financials",
      question: "Are there any related-party transactions?",
      purpose: "Identifying non-arm's length deals that inflate profit.",
      ...(isFlagged(fin) || isFlagged(contr)
        ? referral("flagged disclosure gaps in the financial/contracts domains mean related-party completeness is unverified.")
        : verified(
            "None identified beyond disclosed intercompany service agreements, all priced on documented arm's-length terms.",
            documentSource(deal, 8),
          )),
    },
    // Tax Risk
    {
      category: "Tax Risk",
      question: "What is the \"Nexus\" footprint for Sales & Use tax?",
      purpose: "To find unpaid state/local taxes in the US.",
      ...verified(
        `Nexus study covers all jurisdictions where ${name} has employees, inventory, or economic nexus; registrations reconcile to the filing calendar in the VDR.`,
        documentSource(deal, 9),
      ),
    },
    {
      category: "Tax Risk",
      question: "Has there been a recent Transfer Pricing study?",
      purpose: "Essential for multi-national companies to avoid tax audits.",
      ...verified(
        `Intercompany charges are covered by a transfer-pricing memorandum updated within the last 24 months; methodology is consistent across periods.`,
        documentSource(deal, 10),
      ),
    },
    {
      category: "Tax Risk",
      question: "Are there any open or \"threatened\" tax audits?",
      purpose: "Known audits are excluded; insurers want to know the \"vibe.\"",
      ...(isFlagged(tax)
        ? referral(`the tax-compliance warranty is flagged (${tax?.missingDisclosures.join("; ") || "elevated risk score"}).`)
        : verified(
            "No audits open or threatened per management confirmation and tax counsel's review of authority correspondence.",
            documentSource(deal, 11),
          )),
    },
    {
      category: "Tax Risk",
      question: "Did you diligence the target's R&D tax credits?",
      purpose: "These are high-risk areas for clawbacks by tax authorities.",
      ...(sector === "SaaS / Technology"
        ? verified(
            "R&D credits claimed in the last three years were re-performed on a sample basis; technical narratives and cost pools are documented in the VDR.",
            documentSource(deal, 12),
          )
        : verified(
            "R&D credit claims are immaterial for this target; no clawback exposure identified.",
            documentSource(deal, 12),
          )),
    },
    // Legal & Ops
    {
      category: "Legal & Ops",
      question: "Any \"Change of Control\" triggers in key contracts?",
      purpose: "To ensure the target doesn't lose its top customers at closing.",
      ...(isFlagged(contr)
        ? referral(
            contr && contr.missingDisclosures.length > 0
              ? `the contracts warranty is flagged: ${contr.missingDisclosures.join("; ")}.`
              : "the material-contracts warranty carries a high risk score.",
          )
        : verified(
            "Change-of-control review across the top-20 contracts found consent requirements only in two supplier agreements, both with consent letters already in hand.",
            documentSource(deal, 13),
          )),
    },
    {
      category: "Legal & Ops",
      question: "Are any top 5 customers up for renewal within 6 months?",
      purpose: "Risk of immediate post-close revenue loss.",
      ...verified(RENEWAL_CYCLE[index % RENEWAL_CYCLE.length]!, documentSource(deal, 14)),
    },
    {
      category: "Legal & Ops",
      question: "Have you reviewed \"Work for Hire\" IP agreements?",
      purpose: "Ensuring the target actually owns the software/tech it sells.",
      ...(isFlagged(ip)
        ? referral("the IP-ownership warranty is flagged; contractor assignment coverage for core technology is incomplete in the VDR.")
        : verified(
            "Employee and contractor IP assignment agreements were sampled across engineering; core product IP chain-of-title is clean.",
            documentSource(deal, 15),
          )),
    },
    {
      category: "Legal & Ops",
      question: "What is the status of \"Off-balance sheet\" liabilities?",
      purpose: "Looking for hidden guarantees or environmental \"tails.\"",
      ...(isFlagged(env)
        ? referral(`environmental exposure is flagged (${env?.missingDisclosures.join("; ") || "elevated risk score"}), which is the classic off-balance-sheet tail.`)
        : verified(
            "Nothing beyond disclosed operating leases and ordinary-course performance bonds; no undisclosed guarantees identified.",
            documentSource(deal, 16),
          )),
    },
    // Employment
    {
      category: "Employment",
      question: "Are contractors correctly classified (1099 vs W2)?",
      purpose: "One of the most common sources of large R&W claims.",
      ...(isFlagged(empl)
        ? referral(`the employment warranty is flagged (${empl?.missingDisclosures.join("; ") || "elevated risk score"}); classification exposure cannot be sized from the VDR.`)
        : verified(
            "Contractor population reviewed against control/economics tests; no systemic misclassification pattern identified.",
            documentSource(deal, 17),
          )),
    },
    {
      category: "Employment",
      question: "Any history of \"Me Too\" or harassment claims?",
      purpose: "Assessing corporate culture and potential legal \"landmines.\"",
      ...(isFlagged(empl)
        ? referral("open employment disclosure gaps mean claim history completeness is unverified.")
        : verified(
            "No harassment claims, settlements, or NDAs involving senior leadership in the last five years per the litigation schedule.",
            documentSource(deal, 18),
          )),
    },
    {
      category: "Employment",
      question: "Is there a significant \"unfunded\" pension liability?",
      purpose: "Major financial risk that insurers almost always exclude.",
      ...verified(PENSION_CYCLE[index % PENSION_CYCLE.length]!, documentSource(deal, 19)),
    },
    // Compliance
    {
      category: "Compliance",
      question: "Does the target have a formal FCPA/Anti-Bribery policy?",
      purpose: "Crucial for targets with overseas operations.",
      ...verified(
        "A board-adopted anti-bribery policy is in place with annual training; third-party intermediaries pass through documented onboarding screening.",
        documentSource(deal, 20),
      ),
    },
    {
      category: "Compliance",
      question: "What is the Target's Cyber/Data Privacy maturity?",
      purpose: "To determine if the Cyber exclusion can be narrowed.",
      ...verified(CYBER_BY_SECTOR[sector], documentSource(deal, 21)),
    },
    {
      category: "Compliance",
      question: "Any Sanctions exposure (e.g., Russia, Belarus)?",
      purpose: "Ensuring the deal doesn't violate international law.",
      ...verified(
        "Customer and supplier files screened against OFAC/EU/UK lists; no revenue from sanctioned jurisdictions or listed parties.",
        documentSource(deal, 22),
      ),
    },
    // Diligence Quality
    {
      category: "Diligence Quality",
      question: "Were any documents withheld from the Data Room?",
      purpose: "Identifying \"blind spots\" where the buyer has no info.",
      ...(deal.ddQuality.tier === "Excellent"
        ? verified(
            `Data room certified complete by the sellers; composite quality score of ${deal.ddQuality.compositeScore}/100 (${deal.ddQuality.tier}).`,
            "Data Room Quality Report",
          )
        : deal.ddQuality.tier === "Standard"
          ? verified(
              `Minor gaps only; composite quality score of ${deal.ddQuality.compositeScore}/100 (${deal.ddQuality.tier}) with no domain scored below the underwriting floor.`,
              "Data Room Quality Report",
            )
          : referral(
              `the data room scores ${deal.ddQuality.compositeScore}/100 (${deal.ddQuality.tier}); completeness cannot be certified at this tier.`,
            )),
    },
    {
      category: "Diligence Quality",
      question: "What is the \"Biggest Risk\" you identified in DD?",
      purpose: "A test of the Buyer's honesty and depth of understanding.",
      ...(highestSeverity && highestSeverity.riskLevel !== "Low"
        ? referral(
            `the warranty matrix ranks ${highestLabel} as the top exposure (severity ${highestSeverity.severityScore}/100, ${highestSeverity.riskLevel} risk); the buyer's own framing of this risk should come from the deal team directly.`,
          )
        : verified(
            `The warranty matrix ranks ${highestLabel} as the highest residual exposure at severity ${highestSeverity?.severityScore ?? 0}/100 — within normal bounds for the sector, with no High-risk items open.`,
            "Risk & Underwriting Matrix",
          )),
    },
  ];

  return items.map((item, i) => ({ number: i + 1, ...item }));
}
