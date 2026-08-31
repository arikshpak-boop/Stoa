/**
 * The standard W&I exclusion library.
 *
 * Ranked by how routinely the market applies each one, from Universal
 * (effectively every policy) down to Bespoke (deal-specific). `wording` is the
 * standard underwriter policy language a carrier would attach; it is presented
 * verbatim so a broker can see exactly what is being asked for.
 */

export type ExclusionFrequency =
  | "Universal"
  | "Very High"
  | "High"
  | "Common"
  | "Moderate"
  | "Occasional"
  | "Rare"
  | "Bespoke";

export type ExclusionCategory =
  | "Core"
  | "Legal"
  | "Financial"
  | "Enviro"
  | "HR"
  | "Tax"
  | "Underwriting"
  | "Timing"
  | "Tech"
  | "Ops"
  | "Sector"
  | "Political"
  | "Health"
  | "Real Estate";

export interface LibraryExclusion {
  id: string;
  rank: number;
  frequency: ExclusionFrequency;
  name: string;
  category: ExclusionCategory;
  description: string;
  wording: string;
}

export const EXCLUSION_FREQUENCY_ORDER: readonly ExclusionFrequency[] = [
  "Universal",
  "Very High",
  "High",
  "Common",
  "Moderate",
  "Occasional",
  "Rare",
  "Bespoke",
];

export const EXCLUSION_LIBRARY: readonly LibraryExclusion[] = [
  { id: "actual-knowledge", rank: 1, frequency: "Universal", name: "Actual Knowledge", category: "Core", description: "Breaches known by the deal team before binding.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any breach of Representation of which any member of the Deal Team had Actual Knowledge prior to the Inception Date." },
  { id: "fraud-of-the-insured", rank: 2, frequency: "Universal", name: "Fraud of the Insured", category: "Legal", description: "Coverage is void if the Buyer (insured) acts dishonestly.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any fraud, willful misconduct, or intentional misrepresentation by or on behalf of the Insured." },
  { id: "purchase-price-adjustments", rank: 3, frequency: "Universal", name: "Purchase Price Adjustments", category: "Financial", description: "Claims that fall under closing accounts/locked-box leakage.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any purchase price adjustment, working capital adjustment, earn-out, or leakage (permitted or unpermitted) under the Acquisition Agreement." },
  { id: "forward-looking-reps", rank: 4, frequency: "Universal", name: "Forward-Looking Reps", category: "Financial", description: "Projections, forecasts, or future revenue “guarantees.”", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any representation to the extent it relates to projections, forecasts, budgets, future profitability, or future performance of the Target." },
  { id: "uninsurable-fines", rank: 5, frequency: "Universal", name: "Uninsurable Fines", category: "Legal", description: "Fines that are legally prohibited from being insured.", wording: "The Insurer shall not be liable for any Loss to the extent such Loss consists of civil, criminal, or administrative fines, penalties, or punitive damages that are uninsurable under applicable law." },
  { id: "asbestos-pcbs", rank: 6, frequency: "Very High", name: "Asbestos & PCBs", category: "Enviro", description: "Standard legacy toxic material carve-out.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the presence, release, exposure to, or abatement of asbestos, asbestos-containing materials, or polychlorinated biphenyls (PCBs)." },
  { id: "pension-underfunding", rank: 7, frequency: "Very High", name: "Pension Underfunding", category: "HR", description: "Liability for defined benefit plan deficits.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any underfunding, unfunded liability, or failure to meet minimum funding standards of any defined benefit pension plan." },
  { id: "transfer-pricing", rank: 8, frequency: "Very High", name: "Transfer Pricing", category: "Tax", description: "Non-arm’s length intercompany pricing risks.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any adjustment by a Tax Authority regarding transfer pricing or non-arm's length transactions between Target Group Entities." },
  { id: "secondary-tax-liability", rank: 9, frequency: "Very High", name: "Secondary Tax Liability", category: "Tax", description: "Tax debts from being part of a previous consolidated group.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with secondary tax liabilities resulting from joint and several tax liability or inclusion in a consolidated, combined, or fiscal unity tax group prior to Closing." },
  { id: "nols-tax-attributes", rank: 10, frequency: "High", name: "NOLs & Tax Attributes", category: "Tax", description: "Future usability of deferred tax assets/R&D credits.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the availability, valuation, realization, or future utilization of any Net Operating Losses (NOLs), tax credits, or other tax attributes of the Target Group." },
  { id: "diligence-gaps", rank: 11, frequency: "High", name: "Diligence Gaps", category: "Underwriting", description: "Any area not reviewed by a 3rd party diligence provider.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any matter, topic, or operational unit excluded from or not covered by the Scope of Work of the Final Diligence Reports." },
  { id: "interim-breaches", rank: 12, frequency: "High", name: "Interim Breaches", category: "Timing", description: "Breaches occurring between Signing and Closing.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any breach occurring during the Interim Period of which the Insured becomes aware prior to Closing, unless covered by a specific interim breach endorsement." },
  { id: "cyber-data-privacy", rank: 13, frequency: "High", name: "Cyber / Data Privacy", category: "Tech", description: "Excluded if no standalone cyber policy is in place.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any Data Breach, Cyber Incident, or non-compliance with Data Protection Laws, except to the extent covered by underlying Cyber Liability Insurance." },
  { id: "wage-hour-flsa", rank: 14, frequency: "High", name: "Wage & Hour / FLSA", category: "HR", description: "Unpaid overtime or misclassification (1099 vs W2).", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with worker misclassification (independent contractor vs. employee) or compliance with applicable wage, hour, and overtime laws (including FLSA)." },
  { id: "product-liability-recall", rank: 15, frequency: "Common", name: "Product Liability/Recall", category: "Ops", description: "Mass defects or safety recalls (requires product liability policy).", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with product liability, bodily injury, property damage, or voluntary/mandatory product recalls attributable to products manufactured or sold prior to Closing." },
  { id: "environmental-known", rank: 16, frequency: "Common", name: "Environmental (Known)", category: "Enviro", description: "Known contamination identified in Phase I/II reports.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any Environmental Condition or Hazardous Substance contamination disclosed in the Phase I or Phase II Environmental Site Assessments." },
  { id: "condition-of-assets", rank: 17, frequency: "Common", name: "Condition of Assets", category: "Ops", description: "“Wear and tear” or physical state of machinery.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the physical condition, ordinary wear and tear, maintenance deficits, or operational fitness of any real or personal property." },
  { id: "professional-indemnity", rank: 18, frequency: "Common", name: "Professional Indemnity", category: "Ops", description: "Professional E&O risks (standard for service firms).", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with professional negligence, Errors & Omissions (E&O), or failure to perform professional services for clients/customers prior to Closing." },
  { id: "fcpa-anti-bribery", rank: 19, frequency: "Common", name: "FCPA / Anti-Bribery", category: "Legal", description: "Corruption risks (often a partial carve-out).", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any breach of the Foreign Corrupt Practices Act (FCPA), UK Bribery Act, or applicable anti-bribery laws." },
  { id: "aml-sanctions", rank: 20, frequency: "Common", name: "AML / Sanctions", category: "Legal", description: "Non-compliance with OFAC or international sanctions.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with non-compliance with OFAC, trade sanctions, export controls, or anti-money laundering (AML) laws." },
  { id: "pfas", rank: 21, frequency: "Moderate", name: "PFAS (Forever Chemicals)", category: "Enviro", description: "Rapidly rising exclusion for industrial/chemical deals.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the presence, discharge, manufacture, exposure to, or remediation of per- and polyfluoroalkyl substances (PFAS)." },
  { id: "collective-bargaining", rank: 22, frequency: "Moderate", name: "Collective Bargaining", category: "HR", description: "Risks from ongoing union disputes or strikes.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with labor union negotiations, strikes, work stoppages, or breaches of collective bargaining agreements." },
  { id: "inventory-valuation", rank: 23, frequency: "Moderate", name: "Inventory Valuation", category: "Financial", description: "Claims that inventory is obsolete or overvalued.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the valuation, realizability, obsolescence, or shrinkage of inventory." },
  { id: "accounts-receivable", rank: 24, frequency: "Moderate", name: "Accounts Receivable", category: "Financial", description: "The “collectability” of outstanding invoices.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the collectability, bad debt reserves, or write-off of accounts receivable post-Closing." },
  { id: "healthcare-billing", rank: 25, frequency: "Moderate", name: "Healthcare Billing", category: "Sector", description: "Medicare/Medicaid “upcoding” or overbilling risks.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with billing, coding, or reimbursement compliance under Medicare, Medicaid, or third-party healthcare payors." },
  { id: "solvency-preference", rank: 26, frequency: "Moderate", name: "Solvency/Preference", category: "Legal", description: "Risks that the deal is a “fraudulent conveyance.”", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any claim that the Transaction constitutes a fraudulent transfer, preference, or voidable conveyance under insolvency laws." },
  { id: "it-integrity", rank: 27, frequency: "Moderate", name: "IT Integrity", category: "Tech", description: "Obsolescence or “end of life” software/hardware.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the technical obsolescence, end-of-life status, or necessary capital upgrades of IT infrastructure, hardware, or software." },
  { id: "specific-litigation", rank: 28, frequency: "Occasional", name: "Specific Litigation", category: "Legal", description: "Any lawsuit mentioned in the disclosure schedules.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the matter set forth in [Schedule X / Disclosure Schedule Reference] (Disclosed Litigation)." },
  { id: "ip-infringement-known", rank: 29, frequency: "Occasional", name: "IP Infringement (Known)", category: "Tech", description: "Ongoing disputes over patents or trademarks.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any third-party claim or allegation of intellectual property infringement disclosed or referenced in the Disclosure Schedules." },
  { id: "tax-dac6", rank: 30, frequency: "Occasional", name: "Tax - DAC6", category: "Tax", description: "Reporting of cross-border tax arrangements (Europe).", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with non-compliance with Council Directive (EU) 2018/822 (DAC6) or mandatory cross-border tax disclosure rules." },
  { id: "change-of-control", rank: 31, frequency: "Occasional", name: "Change of Control", category: "Ops", description: "Customer/Supplier contracts that cancel upon sale.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the termination, modification, or renegotiation of any Material Contract resulting from the change of control executed by the Transaction." },
  { id: "salt", rank: 32, frequency: "Occasional", name: "State & Local Tax (SALT)", category: "Tax", description: "Specific US state nexus or sales tax exposure.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with unfiled state, local, or sales/use tax liabilities in jurisdictions where Target has not historically filed returns." },
  { id: "employee-misconduct", rank: 33, frequency: "Occasional", name: "Employee Misconduct", category: "HR", description: "Historic sexual harassment or “Me Too” claims.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with claims of sexual harassment, discrimination, or executive misconduct occurring prior to Closing." },
  { id: "erisa-compliance", rank: 34, frequency: "Occasional", name: "ERISA Compliance", category: "HR", description: "Technical non-compliance with US benefit laws.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with excise taxes, penalties, or compliance failures under Title I or Title IV of ERISA." },
  { id: "ai-training-data", rank: 35, frequency: "Rare", name: "AI Training Data", category: "Tech", description: "(New) Legality of data used to train AI models.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with allegations that artificial intelligence models or algorithms were trained using copyrighted, proprietary, or unauthorized data." },
  { id: "war-terrorism", rank: 36, frequency: "Rare", name: "War & Terrorism", category: "Political", description: "Losses triggered by active geopolitical conflict.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with war, invasion, acts of foreign enemies, hostilities, civil war, rebellion, revolution, or acts of terrorism." },
  { id: "covid-pandemic", rank: 37, frequency: "Rare", name: "COVID-19 / Pandemic", category: "Health", description: "Specific lingering PPP loan or supply chain issues.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with government relief loans (e.g., PPP loans), pandemic-related subsidies, or compliance with COVID-19 emergency regulations." },
  { id: "title-to-real-estate", rank: 38, frequency: "Rare", name: "Title to Real Estate", category: "Real Estate", description: "Usually covered by Title Insurance, so W&I excludes.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with defect in title to, encumbrance on, or ownership of Real Property, to the extent coverable under a standard Title Insurance policy." },
  { id: "key-person-risk", rank: 39, frequency: "Rare", name: "Key Person Risk", category: "HR", description: "Losses caused purely by the exit of a founder.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the departure, resignation, or loss of services of any key employee, founder, or executive officer post-Closing." },
  { id: "tariff-trade-compliance", rank: 40, frequency: "Rare", name: "Tariff/Trade Compliance", category: "Ops", description: "Export/Import duty risks from trade wars.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with duties, tariffs, or non-compliance with customs and import/export regulations prior to Closing." },
  { id: "consumer-protection", rank: 41, frequency: "Rare", name: "Consumer Protection", category: "Legal", description: "Deceptive advertising or consumer fraud claims.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with allegations of deceptive trade practices, false advertising, or consumer protection law violations." },
  { id: "environmental-general", rank: 42, frequency: "Rare", name: "Environmental (General)", category: "Enviro", description: "Full pollution “blanket” exclusion (rarely this broad now).", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any Environmental Liability, pollution event, or non-compliance with Environmental Laws." },
  { id: "anti-trust-competition", rank: 43, frequency: "Rare", name: "Anti-Trust / Competition", category: "Legal", description: "Historic price-fixing or market collusion.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with price-fixing, cartel activity, market allocation, or other anti-competitive conduct under Antitrust Laws." },
  { id: "crypto-digital-assets", rank: 44, frequency: "Bespoke", name: "Cryptocurrency / Digital Assets", category: "Tech", description: "Custody or valuation of target's crypto holdings.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with the custody, theft, loss, valuation, or regulatory status of digital assets, cryptocurrencies, or smart contracts." },
  { id: "joint-venture-conduct", rank: 45, frequency: "Bespoke", name: "Joint Venture Conduct", category: "Ops", description: "Liability from JVs where Target has <50% control.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with acts, omissions, or liabilities of any Joint Venture or non-controlled entity in which the Target holds a minority interest." },
  { id: "government-contracts", rank: 46, frequency: "Bespoke", name: "Government Contracts", category: "Sector", description: "Specific “False Claims Act” risks for contractors.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with audits, debarment, or claims under the False Claims Act or federal procurement rules regarding Government Contracts." },
  { id: "capital-expenditure", rank: 47, frequency: "Bespoke", name: "Capital Expenditure", category: "Financial", description: "Failure to meet a specific “CapEx” budget post-deal.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any failure by the Target to complete budgeted capital expenditure projects or satisfy post-Closing CapEx targets." },
  { id: "sovereign-immunity", rank: 48, frequency: "Bespoke", name: "Sovereign Immunity", category: "Legal", description: "Dealing with state-owned entities.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with unenforceable contractual remedies due to claims of sovereign immunity by any counterparty." },
  { id: "successor-liability", rank: 49, frequency: "Bespoke", name: "Successor Liability", category: "Legal", description: "Liabilities from companies the Target acquired previously.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with pre-acquisition liabilities, indemnity claims, or historical obligations of prior entities acquired by the Target Group." },
  { id: "moral-hazard", rank: 50, frequency: "Bespoke", name: "Moral Hazard", category: "Legal", description: "Broad “catch-all” for suspiciously risky behavior.", wording: "The Insurer shall not be liable for any Loss arising out of, relating to, or in connection with any transaction, restructuring, or action undertaken by the Insured or Target primarily to create or inflate a claim under this Policy." },
];

const BY_ID = new Map(EXCLUSION_LIBRARY.map((exclusion) => [exclusion.id, exclusion]));

export function isLibraryExclusionId(id: string): boolean {
  return BY_ID.has(id);
}

export function libraryExclusionById(id: string): LibraryExclusion | undefined {
  return BY_ID.get(id);
}

/** Library entries grouped by frequency, in market-standard order. */
export function groupedLibraryExclusions(): Array<{ frequency: ExclusionFrequency; items: LibraryExclusion[] }> {
  return EXCLUSION_FREQUENCY_ORDER.map((frequency) => ({
    frequency,
    items: EXCLUSION_LIBRARY.filter((exclusion) => exclusion.frequency === frequency),
  })).filter((group) => group.items.length > 0);
}
