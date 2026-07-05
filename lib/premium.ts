export interface BidInputParameters {
  limitAmount: number;
  rateOnLinePercent: number;
  underwritingFees: number;
  taxes?: number;
}

export interface BidCalculationResult {
  grossPremium: number;
  underwritingFees: number;
  taxes: number;
  totalTransactionValue: number;
}

/**
 * Gross Premium = Limit of Liability x Rate on Line (%)
 * Total Transaction Value = Gross Premium + Underwriting Fees + Taxes
 */
export function calculatePremium(input: BidInputParameters): BidCalculationResult {
  const grossPremium = input.limitAmount * (input.rateOnLinePercent / 100);
  const taxes = input.taxes ?? 0;

  return {
    grossPremium: Math.round(grossPremium * 100) / 100,
    underwritingFees: input.underwritingFees,
    taxes,
    totalTransactionValue: Math.round((grossPremium + input.underwritingFees + taxes) * 100) / 100,
  };
}

export function calculateLimitPercentOfEv(limitAmount: number, enterpriseValue: number): number {
  if (enterpriseValue <= 0) return 0;
  return Math.round((limitAmount / enterpriseValue) * 10000) / 100;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
