import { describe, expect, it } from "vitest";
import { classifyDocument, isIncludedInAnalysis } from "./document-classification";

describe("classifyDocument", () => {
  it("classifies SPA/merger drafts as the transaction agreement bucket", () => {
    expect(classifyDocument({ fileName: "SPA_Draft_v3.pdf", fileType: "pdf" }).classification).toBe("spa-transaction-agreement");
    expect(classifyDocument({ fileName: "Share_Purchase_Agreement.pdf", fileType: "pdf" }).classification).toBe("spa-transaction-agreement");
    expect(classifyDocument({ fileName: "Merger_Agreement.pdf", fileType: "pdf" }).classification).toBe("spa-transaction-agreement");
    expect(classifyDocument({ fileName: "LOI_Draft.pdf", fileType: "pdf" }).classification).toBe("spa-transaction-agreement");
  });

  it("classifies financial models and statements", () => {
    expect(classifyDocument({ fileName: "Financial_Model_FY25.xlsx", fileType: "xlsx" }).classification).toBe("financial-statement");
    expect(classifyDocument({ fileName: "Q1_FY26_Financials.xlsx", fileType: "xlsx" }).classification).toBe("financial-statement");
    expect(classifyDocument({ fileName: "Reserve_Report_2025.xlsx", fileType: "xlsx" }).classification).toBe("financial-statement");
  });

  it("classifies disclosure schedules", () => {
    expect(classifyDocument({ fileName: "Disclosure_Schedule.docx", fileType: "docx" }).classification).toBe("disclosure-schedule");
    expect(classifyDocument({ fileName: "Employment_Agreements_Schedule.docx", fileType: "docx" }).classification).toBe(
      "disclosure-schedule",
    );
  });

  it("classifies org/corporate documents", () => {
    expect(classifyDocument({ fileName: "Certificate_of_Incorporation.pdf", fileType: "pdf" }).classification).toBe("org-document");
    expect(classifyDocument({ fileName: "Cap_Table.xlsx", fileType: "xlsx" }).classification).toBe("org-document");
    expect(classifyDocument({ fileName: "Bylaws_Amended.pdf", fileType: "pdf" }).classification).toBe("org-document");
  });

  it("classifies correspondence", () => {
    expect(classifyDocument({ fileName: "Email_Correspondence_Buyer_Counsel.pdf", fileType: "pdf" }).classification).toBe(
      "correspondence",
    );
  });

  it("classifies unrecognized personal/irrelevant documents as unclassifiable-irrelevant, matching the reproduced Industrial SHP finding", () => {
    expect(classifyDocument({ fileName: "Personal_Invoice_March2026.pdf", fileType: "pdf" }).classification).toBe(
      "unclassifiable-irrelevant",
    );
    expect(classifyDocument({ fileName: "Travel_Itinerary_Chicago.pdf", fileType: "pdf" }).classification).toBe(
      "unclassifiable-irrelevant",
    );
    expect(classifyDocument({ fileName: "John_Doe_Employment_Contract.docx", fileType: "docx" }).classification).toBe(
      "unclassifiable-irrelevant",
    );
  });

  it("is deterministic for the same filename", () => {
    const a = classifyDocument({ fileName: "SPA_Draft_v3.pdf", fileType: "pdf" });
    const b = classifyDocument({ fileName: "SPA_Draft_v3.pdf", fileType: "pdf" });
    expect(a).toEqual(b);
  });

  it("returns a confidence between 0 and 1", () => {
    const result = classifyDocument({ fileName: "Personal_Invoice_March2026.pdf", fileType: "pdf" });
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

describe("isIncludedInAnalysis", () => {
  it("excludes only the unclassifiable-irrelevant bucket", () => {
    expect(isIncludedInAnalysis("unclassifiable-irrelevant")).toBe(false);
    expect(isIncludedInAnalysis("spa-transaction-agreement")).toBe(true);
    expect(isIncludedInAnalysis("financial-statement")).toBe(true);
    expect(isIncludedInAnalysis("disclosure-schedule")).toBe(true);
    expect(isIncludedInAnalysis("org-document")).toBe(true);
    expect(isIncludedInAnalysis("correspondence")).toBe(true);
  });
});
