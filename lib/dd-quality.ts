/**
 * Data Room Quality & Premium Adjustment model, derived from the
 * "Data Room Validation & Due Diligence Assessment Model" spreadsheet:
 * https://docs.google.com/spreadsheets/d/1-2-djJEKKXYXCvn8AEp1GmA0L3T0yVpnxTChWUTyabU
 *
 * The model scores a data room on three weighted dimensions (Structure 15%,
 * Quality 60%, Clarity 25%), maps the weighted composite to a Quality
 * Adjustment Factor, and applies it to a 1.15% base Rate on Line:
 *   Excellent DD -> composite >= 80/100 -> 0.85x -> 0.98% recommended RoL
 *   Standard DD  -> composite >= 60/100 -> 1.05x -> 1.21% recommended RoL
 *   Weak DD      -> composite >= 40/100 -> 1.25x -> 1.44% recommended RoL
 *   Poor DD      -> composite <  40/100 -> decline ("Do not offer")
 *
 * Scores are exposed on a 0-100 scale for presentation; the weighting and
 * adjustment internals stay in this module and are not surfaced in the UI.
 */

export type DDTier = "Excellent" | "Standard" | "Weak" | "Poor";

const DD_WEIGHTS = { structure: 0.15, quality: 0.6, clarity: 0.25 } as const;
const BASE_RATE_ON_LINE_PERCENT = 1.15;

export interface DDQualityInputs {
  documentCount: number;
  missingDisclosureCount: number;
  averageExtractionConfidence: number;
}

export interface DDQualityAssessment {
  structureScore: number;
  qualityScore: number;
  clarityScore: number;
  compositeScore: number;
  tier: DDTier;
  recommendedRateOnLinePercent: number | null;
  recommendedAction: string;
}

function clampScore100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function assessDataRoomQuality(inputs: DDQualityInputs): DDQualityAssessment {
  const structureScore = clampScore100((1 + inputs.documentCount * 0.8) * 20);
  const qualityScore = clampScore100((5 - inputs.missingDisclosureCount * 0.5) * 20);
  const clarityScore = clampScore100(inputs.averageExtractionConfidence * 100);

  const compositeScore = Math.round(
    structureScore * DD_WEIGHTS.structure + qualityScore * DD_WEIGHTS.quality + clarityScore * DD_WEIGHTS.clarity,
  );

  let tier: DDTier;
  let qualityAdjustmentFactor: number | null;
  let recommendedAction: string;

  if (compositeScore >= 80) {
    tier = "Excellent";
    qualityAdjustmentFactor = 0.85;
    recommendedAction = "Bind at standard terms with a premium credit for data room quality.";
  } else if (compositeScore >= 60) {
    tier = "Standard";
    qualityAdjustmentFactor = 1.05;
    recommendedAction = "Bind at standard terms.";
  } else if (compositeScore >= 40) {
    tier = "Weak";
    qualityAdjustmentFactor = 1.25;
    recommendedAction = "Bind with a loaded premium and enhanced specific exclusions.";
  } else {
    tier = "Poor";
    qualityAdjustmentFactor = null;
    recommendedAction = "Do not offer until data room deficiencies are remediated.";
  }

  const recommendedRateOnLinePercent =
    qualityAdjustmentFactor === null ? null : roundTo(BASE_RATE_ON_LINE_PERCENT * qualityAdjustmentFactor, 2);

  return {
    structureScore: Math.round(structureScore),
    qualityScore: Math.round(qualityScore),
    clarityScore: Math.round(clarityScore),
    compositeScore,
    tier,
    recommendedRateOnLinePercent,
    recommendedAction,
  };
}
