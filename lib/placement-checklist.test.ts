import { describe, expect, it } from "vitest";
import {
  CHECKLIST_DOCUMENT_COUNT,
  PLACEMENT_CHECKLIST,
  matchChecklistIds,
} from "./placement-checklist";

describe("placement checklist", () => {
  it("covers all seven carrier categories", () => {
    expect(PLACEMENT_CHECKLIST.map((group) => group.category)).toEqual([
      "Transaction", "Financial", "Tax", "Legal", "Human Resources", "Operational", "Closing Documents",
    ]);
  });

  it("holds 20 documents with unique ids and a focus area each", () => {
    const documents = PLACEMENT_CHECKLIST.flatMap((group) => group.documents);
    expect(documents).toHaveLength(20);
    expect(CHECKLIST_DOCUMENT_COUNT).toBe(20);
    expect(new Set(documents.map((d) => d.id)).size).toBe(20);
    expect(documents.every((d) => d.focus.trim().length > 0)).toBe(true);
    expect(documents.every((d) => d.keywords.length > 0)).toBe(true);
  });
});

describe("matchChecklistIds", () => {
  it("matches documents by filename regardless of case", () => {
    expect(matchChecklistIds(["Project_Atlas_SPA_v7.pdf"])).toContain("spa");
    expect(matchChecklistIds(["QUALITY OF EARNINGS.xlsx"])).toContain("qoe");
    expect(matchChecklistIds(["transfer pricing study.pdf"])).toContain("transfer-pricing");
  });

  it("matches several documents across one upload set", () => {
    const matched = matchChecklistIds([
      "SPA_execution_copy.pdf",
      "Disclosure Letter.docx",
      "Phase I Environmental.pdf",
      "Non-Reliance Letter - KPMG.pdf",
    ]);
    expect(matched).toContain("spa");
    expect(matched).toContain("disclosure-letter");
    expect(matched).toContain("environmental-phase-i");
    expect(matched).toContain("nrl");
    expect(matched.size).toBe(4);
  });

  it("returns nothing for unrelated file names", () => {
    expect(matchChecklistIds(["photo.png", "notes.txt"]).size).toBe(0);
  });

  it("handles an empty upload set", () => {
    expect(matchChecklistIds([]).size).toBe(0);
  });
});
