import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { Button } from "@/components/ui/button";
import { UnderwritingGrid } from "@/components/risk/UnderwritingGrid";
import { ExclusionReportEditor } from "@/components/risk/ExclusionReportEditor";
import { DataRoomQualityPanel } from "@/components/risk/DataRoomQualityPanel";

export default function DealRiskPage({ params }: { params: { dealId: string } }) {
  const deal = getDealStore().get(params.dealId);

  if (!deal) {
    notFound();
  }

  const highRiskCount = deal.warranties.filter((w) => w.riskLevel === "High").length;
  const mediumRiskCount = deal.warranties.filter((w) => w.riskLevel === "Medium").length;

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/deals/${deal.id}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to {deal.target.companyName}
        </Link>
      </Button>

      <h1 className="text-2xl font-semibold tracking-tight text-primary">Risk &amp; Underwriting Matrix</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {highRiskCount} High risk and {mediumRiskCount} Medium risk warranties identified across {deal.warranties.length}{" "}
        Representations & Warranties for {deal.target.sector}.
      </p>

      <div className="mt-8">
        <DataRoomQualityPanel assessment={deal.ddQuality} />
      </div>

      <div className="mt-8">
        <UnderwritingGrid warranties={deal.warranties} exclusions={deal.exclusions} />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-primary">Specific Exclusion Report</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Auto-drafted from high and medium risk triggers. Edits here are staged locally until the next locked
          submission version.
        </p>
        <div className="mt-4">
          <ExclusionReportEditor exclusions={deal.exclusions} />
        </div>
      </div>
    </div>
  );
}
