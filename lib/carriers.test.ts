import { describe, expect, it } from "vitest";
import {
  CARRIER_PANEL,
  canCarrierSeeDeal,
  isPanelCarrierId,
  isPanelMember,
  resolveCarrierNames,
} from "./carriers";

describe("carrier panel", () => {
  it("holds the full 25-market panel with unique ids", () => {
    expect(CARRIER_PANEL).toHaveLength(25);
    expect(new Set(CARRIER_PANEL.map((c) => c.id)).size).toBe(25);
  });

  it("recognises panel ids and rejects anything else", () => {
    expect(isPanelCarrierId("aig")).toBe(true);
    expect(isPanelCarrierId("hamilton")).toBe(true);
    expect(isPanelCarrierId("not-a-carrier")).toBe(false);
  });

  it("resolves ids to names and drops unknown ids", () => {
    expect(resolveCarrierNames(["aig", "beazley"])).toEqual(["AIG", "Beazley"]);
    expect(resolveCarrierNames(["aig", "bogus"])).toEqual(["AIG"]);
  });

  it("matches panel membership case-insensitively", () => {
    expect(isPanelMember("Chubb")).toBe(true);
    expect(isPanelMember("  chubb ")).toBe(true);
    expect(isPanelMember("Some Unlisted Market Ltd")).toBe(false);
  });
});

describe("canCarrierSeeDeal", () => {
  it("shows deals that carry no distribution to everyone", () => {
    expect(canCarrierSeeDeal(undefined, "Chubb")).toBe(true);
    expect(canCarrierSeeDeal([], "Chubb")).toBe(true);
  });

  it("shows distributed deals to the selected carriers", () => {
    expect(canCarrierSeeDeal(["AIG", "Chubb"], "Chubb")).toBe(true);
  });

  it("hides distributed deals from panel carriers that were not selected", () => {
    expect(canCarrierSeeDeal(["AIG", "Chubb"], "Beazley")).toBe(false);
  });

  it("fails closed for organisations that are not on the panel", () => {
    expect(canCarrierSeeDeal(["AIG"], "Some Unlisted Market Ltd")).toBe(false);
  });

  it("matches the selected carrier case- and whitespace-insensitively", () => {
    expect(canCarrierSeeDeal(["Berkshire Hathaway (BHSI)"], "  berkshire hathaway (bhsi) ")).toBe(true);
  });

  it("lets platform admins bypass distribution entirely", () => {
    expect(canCarrierSeeDeal(["AIG"], "Stoa Platform Team", { unrestricted: true })).toBe(true);
  });
});

describe("exclusion library", () => {
  it("holds all 50 entries with unique ids and contiguous ranks", async () => {
    const { EXCLUSION_LIBRARY } = await import("./exclusion-library");
    expect(EXCLUSION_LIBRARY).toHaveLength(50);
    expect(new Set(EXCLUSION_LIBRARY.map((e) => e.id)).size).toBe(50);
    expect(EXCLUSION_LIBRARY.map((e) => e.rank).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 50 }, (_, i) => i + 1),
    );
  });

  it("gives every entry policy wording", async () => {
    const { EXCLUSION_LIBRARY } = await import("./exclusion-library");
    expect(EXCLUSION_LIBRARY.every((e) => e.wording.trim().length > 0)).toBe(true);
  });

  it("resolves ids and rejects unknown ones", async () => {
    const { isLibraryExclusionId, libraryExclusionById } = await import("./exclusion-library");
    expect(isLibraryExclusionId("actual-knowledge")).toBe(true);
    expect(isLibraryExclusionId("not-a-real-exclusion")).toBe(false);
    expect(libraryExclusionById("pfas")?.name).toBe("PFAS (Forever Chemicals)");
  });

  it("groups by frequency in market-standard order", async () => {
    const { groupedLibraryExclusions } = await import("./exclusion-library");
    expect(groupedLibraryExclusions().map((g) => g.frequency)).toEqual([
      "Universal", "Very High", "High", "Common", "Moderate", "Occasional", "Rare", "Bespoke",
    ]);
  });
});
