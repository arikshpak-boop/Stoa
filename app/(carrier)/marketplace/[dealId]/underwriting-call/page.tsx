import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PhoneCall } from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { getServerSession } from "@/lib/get-session";
import { canCarrierSeeDeal } from "@/lib/carriers";
import { formatCurrency } from "@/lib/premium";
import { generateUnderwritingBriefing } from "@/lib/underwriting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BidDialog } from "@/components/marketplace/BidDialog";
import { UnderwritingBriefing } from "@/components/underwriting/UnderwritingBriefing";
import { OpenQuestionsPanel } from "@/components/underwriting/OpenQuestionsPanel";

export default async function CarrierUnderwritingCallPage({ params }: { params: { dealId: string } }) {
  const deal = await getDealStore().get(params.dealId);
  const session = getServerSession();

  if (!deal || !session) {
    notFound();
  }

  // Distribution is enforced here too, not just on the marketplace list —
  // otherwise a carrier off the list could open the deal straight by URL.
  if (!canCarrierSeeDeal(deal.distribution?.carrierNames, session.organizationName, {
    unrestricted: session.role === "Admin",
  })) {
    notFound();
  }

  const briefing = generateUnderwritingBriefing(deal);
  const questions = deal.underwritingQuestions ?? [];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/marketplace/${deal.id}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to {deal.target.companyName}
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <PhoneCall className="h-5 w-5 text-accent" aria-hidden="true" />
            <h1 className="text-2xl font-semibold tracking-tight text-primary">Underwriting Call</h1>
            <Badge variant="primary">{deal.target.companyName}</Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            The 25 standard underwriting questions, pre-answered from the locked submission package. Anything the data
            room can't support goes to the deal maker as an open question — their verified reply is appended to the risk
            report before you price the risk.
          </p>
        </div>
        <BidDialog
                recommendedExclusions={deal.exclusions}
          dealId={deal.id}
          dealName={deal.target.companyName}
          enterpriseValue={deal.financials.enterpriseValue}
          currency={deal.financials.currency}
          carrierName={session.organizationName}
          suggestedRateOnLinePercent={deal.ddQuality.recommendedRateOnLinePercent ?? undefined}
          trigger={<Button>Submit Bid</Button>}
          showUnderwritingCallLink={false}
        />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {deal.target.sector} · {formatCurrency(deal.financials.enterpriseValue, deal.financials.currency)} EV ·{" "}
        {deal.organizationName}
      </p>

      <div className="mt-8">
        <UnderwritingBriefing items={briefing} />
      </div>

      <div className="mt-8">
        <OpenQuestionsPanel dealId={deal.id} questions={questions} mode="carrier" carrierName={session.organizationName} />
      </div>
    </div>
  );
}
