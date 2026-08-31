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
    expect(isPanelMember("Atlas Assurance Group")).toBe(false);
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

  it("does not restrict organisations that are not on the panel", () => {
    // Admin and demo carrier accounts are not panel markets, so gating them to
    // "their" selections would hide every deal from them for no benefit.
    expect(canCarrierSeeDeal(["AIG"], "Atlas Assurance Group")).toBe(true);
  });
});
