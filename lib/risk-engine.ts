import {
  WARRANTY_DEFINITIONS,
  type DealWarranty,
  type ExclusionClause,
  type RiskLevel,
  type Sector,
  type WarrantyIdentifier,
} from "./types";

/**
 * Industry-specific risk coefficients applied on top of the base severity
 * score derived from missing disclosures. Values represent additive
 * severity points (0-100 scale) attributable to sector-specific exposure.
 */
const SECTOR_RISK_COEFFICIENTS: Record<Sector, Partial<Record<WarrantyIdentifier, number>>> = {
  "SaaS / Technology": { "IP-01": 28, "CONTR-01": 12, "TAX-01": 6 },
  "Manufacturing": { "ENV-01": 32, "EMPL-01": 14, "CONTR-01": 10 },
  "Healthcare": { "TAX-01": 10, "EMPL-01": 18, "CONTR-01": 16, "ENV-01": 8 },
  "Financial Services": { "TAX-01": 20, "CAPZ-01": 14, "CONTR-01": 10 },
  "Consumer & Retail": { "CONTR-01": 18, "EMPL-01": 12, "ENV-01": 6 },
  "Energy & Natural Resources": { "ENV-01": 36, "CONTR-01": 14, "TAX-01": 8 },
  "Business Services": { "EMPL-01": 16, "CONTR-01": 10, "IP-01": 8 },
};

const MISSING_DISCLOSURE_PENALTY = 18;
const BASE_SEVERITY_FLOOR = 8;

export interface RiskComputationInput {
  sector: Sector;
  documentCount: number;
  missingDisclosuresByWarranty: Partial<Record<WarrantyIdentifier, string[]>>;
}

function classifyRiskLevel(severityScore: number): RiskLevel {
  if (severityScore >= 65) return "High";
  if (severityScore >= 35) return "Medium";
  return "Low";
}

export function computeWarrantyRiskProfile(
  dealId: string,
  input: RiskComputationInput,
): DealWarranty[] {
  return WARRANTY_DEFINITIONS.map((definition) => {
    const missingDisclosures = input.missingDisclosuresByWarranty[definition.identifier] ?? [];
    const sectorCoefficient = SECTOR_RISK_COEFFICIENTS[input.sector][definition.identifier] ?? 0;
    const noDocumentPenalty = input.documentCount === 0 ? 20 : 0;

    const severityScore = Math.min(
      100,
      BASE_SEVERITY_FLOOR +
        sectorCoefficient +
        missingDisclosures.length * MISSING_DISCLOSURE_PENALTY +
        noDocumentPenalty,
    );

    const riskLevel = classifyRiskLevel(severityScore);

    const flagStatus: DealWarranty["flagStatus"] =
      missingDisclosures.length > 0 ? "Flagged" : riskLevel === "High" ? "Under Review" : "Clear";

    const complianceNotes =
      missingDisclosures.length > 0
        ? `${missingDisclosures.length} disclosure schedule(s) missing from the VDR relative to ${definition.label}: ${missingDisclosures.join(", ")}.`
        : `No missing disclosures identified for ${definition.label} at this time.`;

    return {
      id: `${dealId}-${definition.identifier}`,
      dealId,
      warrantyIdentifier: definition.identifier,
      severityScore,
      riskLevel,
      complianceNotes,
      flagStatus,
      missingDisclosures,
    } satisfies DealWarranty;
  });
}

const EXCLUSION_TEMPLATES: Record<WarrantyIdentifier, (dealId: string, warranty: DealWarranty) => ExclusionClause> = {
  "TITLE-01": (dealId, w) => ({
    id: `${dealId}-EXC-TITLE-01`,
    dealId,
    warrantyIdentifier: "TITLE-01",
    title: "Title & Ownership Exclusion",
    draftText: "The Policy shall not respond to any Loss arising from or in connection with a breach of the Title Warranties to the extent such breach was Fairly Disclosed or arises from encumbrances registered against the share register prior to Signing.",
    triggeredBy: `Severity score ${w.severityScore} — ${w.riskLevel} risk classification`,
    editable: true,
  }),
  "CAP-01": (dealId, w) => ({
    id: `${dealId}-EXC-CAP-01`,
    dealId,
    warrantyIdentifier: "CAP-01",
    title: "Capacity & Authority Exclusion",
    draftText: "The Policy shall not respond to any Loss arising from the Seller's lack of corporate authority where such lack of authority was identified in the constitutional documents Fairly Disclosed in the Data Room.",
    triggeredBy: `Severity score ${w.severityScore} — ${w.riskLevel} risk classification`,
    editable: true,
  }),
  "CAPZ-01": (dealId, w) => ({
    id: `${dealId}-EXC-CAPZ-01`,
    dealId,
    warrantyIdentifier: "CAPZ-01",
    title: "Capitalization Exclusion",
    draftText: "The Policy shall not respond to any Loss arising from inaccuracies in the capitalization table to the extent such inaccuracies were Fairly Disclosed in the share register or cap table schedules provided prior to Signing.",
    triggeredBy: `Severity score ${w.severityScore} — ${w.riskLevel} risk classification`,
    editable: true,
  }),
  "FIN-01": (dealId, w) => ({
    id: `${dealId}-EXC-FIN-01`,
    dealId,
    warrantyIdentifier: "FIN-01",
    title: "Financial Statements Exclusion",
    draftText: "The Policy shall not respond to any Loss to the extent arising from known variances between management accounts and audited financial statements identified during underwriting diligence.",
    triggeredBy: `Missing disclosures: ${w.missingDisclosures.join(", ") || "none"}; severity ${w.severityScore}`,
    editable: true,
  }),
  "TAX-01": (dealId, w) => ({
    id: `${dealId}-EXC-TAX-01`,
    dealId,
    warrantyIdentifier: "TAX-01",
    title: "Specific Tax Exclusion",
    draftText: "The Policy shall not respond to any Loss arising from the specific tax exposures identified in the underwriting tax review, including any open enquiries with tax authorities as at the Signing Date, unless separately underwritten via a standalone tax liability policy.",
    triggeredBy: `Severity score ${w.severityScore} — ${w.riskLevel} risk classification`,
    editable: true,
  }),
  "IP-01": (dealId, w) => ({
    id: `${dealId}-EXC-IP-01`,
    dealId,
    warrantyIdentifier: "IP-01",
    title: "Intellectual Property Exclusion",
    draftText: "The Policy shall not respond to any Loss arising from third-party infringement claims relating to open-source software components or IP assignment gaps identified in the technical diligence report and Fairly Disclosed to the Insurer.",
    triggeredBy: `Sector-weighted IP risk — severity ${w.severityScore}`,
    editable: true,
  }),
  "CONTR-01": (dealId, w) => ({
    id: `${dealId}-EXC-CONTR-01`,
    dealId,
    warrantyIdentifier: "CONTR-01",
    title: "Material Contracts Exclusion",
    draftText: "The Policy shall not respond to any Loss arising from change-of-control consent requirements under the Material Contracts listed in the disclosure schedule where consent has not been obtained prior to Closing.",
    triggeredBy: `Severity score ${w.severityScore} — ${w.riskLevel} risk classification`,
    editable: true,
  }),
  "EMPL-01": (dealId, w) => ({
    id: `${dealId}-EXC-EMPL-01`,
    dealId,
    warrantyIdentifier: "EMPL-01",
    title: "Employment & Labor Exclusion",
    draftText: "The Policy shall not respond to any Loss arising from ongoing employment tribunal claims or works council consultation obligations Fairly Disclosed prior to Signing.",
    triggeredBy: `Severity score ${w.severityScore} — ${w.riskLevel} risk classification`,
    editable: true,
  }),
  "ENV-01": (dealId, w) => ({
    id: `${dealId}-EXC-ENV-01`,
    dealId,
    warrantyIdentifier: "ENV-01",
    title: "Environmental Liability Exclusion",
    draftText: "The Policy shall not respond to any Loss arising from pre-existing environmental contamination at owned or leased real property identified in the Phase I/II environmental reports Fairly Disclosed in the Data Room.",
    triggeredBy: `Sector-weighted environmental risk — severity ${w.severityScore}`,
    editable: true,
  }),
};

export function generateExclusionReport(dealId: string, warranties: DealWarranty[]): ExclusionClause[] {
  return warranties
    .filter((warranty) => warranty.riskLevel === "High" || warranty.riskLevel === "Medium")
    .map((warranty) => EXCLUSION_TEMPLATES[warranty.warrantyIdentifier](dealId, warranty));
}
