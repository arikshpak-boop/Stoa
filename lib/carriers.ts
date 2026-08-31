/**
 * The Stoa carrier panel — the W&I markets a deal can be distributed to.
 *
 * Deliberately just identity: no appetite, capacity, or rating data, because
 * inventing those for named real-world markets would read as market intelligence
 * the platform does not actually have.
 */

export interface PanelCarrier {
  id: string;
  name: string;
}

export const CARRIER_PANEL: readonly PanelCarrier[] = [
  { id: "aig", name: "AIG" },
  { id: "liberty-gts", name: "Liberty Global Transaction Solutions" },
  { id: "euclid-transactional", name: "Euclid Transactional" },
  { id: "tokio-marine-hcc", name: "Tokio Marine HCC" },
  { id: "axa-xl", name: "AXA XL" },
  { id: "beazley", name: "Beazley" },
  { id: "chubb", name: "Chubb" },
  { id: "vale-insurance-partners", name: "VALE Insurance Partners" },
  { id: "ambridge-partners", name: "Ambridge Partners" },
  { id: "bhsi", name: "Berkshire Hathaway (BHSI)" },
  { id: "concord-specialty-risk", name: "Concord Specialty Risk" },
  { id: "mosaic-insurance", name: "Mosaic Insurance" },
  { id: "brockwell-capital", name: "Brockwell Capital" },
  { id: "transact-risk-partners", name: "Transact Risk Partners" },
  { id: "cfc-underwriting", name: "CFC Underwriting" },
  { id: "optio-group", name: "Optio Group" },
  { id: "sompo-international", name: "Sompo International" },
  { id: "allied-world", name: "Allied World (AWAC)" },
  { id: "arch-insurance", name: "Arch Insurance" },
  { id: "qbe", name: "QBE" },
  { id: "allianz-agcs", name: "Allianz Global Corporate & Specialty" },
  { id: "great-american", name: "Great American Insurance Group" },
  { id: "ryan-specialty", name: "Ryan Specialty (RSG)" },
  { id: "castel-specialty", name: "Castel Specialty (Transact)" },
  { id: "hamilton", name: "Hamilton" },
];

const BY_ID = new Map(CARRIER_PANEL.map((carrier) => [carrier.id, carrier]));

export function isPanelCarrierId(id: string): boolean {
  return BY_ID.has(id);
}

export function carrierNameFor(id: string): string | undefined {
  return BY_ID.get(id)?.name;
}

export function resolveCarrierNames(ids: readonly string[]): string[] {
  return ids.flatMap((id) => {
    const name = carrierNameFor(id);
    return name ? [name] : [];
  });
}

/** True when an organisation name matches a carrier on the panel. */
export function isPanelMember(organizationName: string): boolean {
  const normalized = organizationName.trim().toLowerCase();
  return CARRIER_PANEL.some((carrier) => carrier.name.toLowerCase() === normalized);
}

/**
 * Whether a carrier organisation may see a given deal.
 *
 * Three cases, in order:
 *  - Deal predates distribution (or was submitted without it): visible to all,
 *    so seeded and legacy deals don't vanish from the marketplace.
 *  - Viewer is not on the panel at all (admin and demo carrier accounts):
 *    visible, since restricting a non-member to "their" selections is meaningless.
 *  - Otherwise: visible only if the broker selected them.
 */
export function canCarrierSeeDeal(
  distributionCarrierNames: readonly string[] | undefined,
  organizationName: string,
): boolean {
  if (!distributionCarrierNames || distributionCarrierNames.length === 0) return true;
  if (!isPanelMember(organizationName)) return true;
  return distributionCarrierNames.some(
    (name) => name.toLowerCase() === organizationName.trim().toLowerCase(),
  );
}
