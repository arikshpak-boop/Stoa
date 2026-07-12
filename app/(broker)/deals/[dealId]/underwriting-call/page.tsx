import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PhoneCall } from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { generateUnderwritingBriefing } from "@/lib/underwriting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnderwritingBriefing } from "@/components/underwriting/UnderwritingBriefing";
import { OpenQuestionsPanel } from "@/components/underwriting/OpenQuestionsPanel";

export default async function BrokerUnderwritingCallPage({ params }: { params: { dealId: string } }) {
  const deal = await getDealStore().get(params.dealId);

  if (!deal) {
    notFound();
  }

  const briefing = generateUnderwritingBriefing(deal);
  const questions = deal.underwritingQuestions ?? [];
  const pendingCount = questions.filter((q) => q.answer === null).length;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/deals/${deal.id}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to {deal.target.companyName}
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <PhoneCall className="h-5 w-5 text-accent" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Underwriting Call</h1>
        {pendingCount > 0 && <Badge variant="warning">{pendingCount} awaiting your answer</Badge>}
      </div>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Carriers reviewing {deal.target.companyName} ask their remaining questions here. Verify each with your insured
        and reply on-platform — every answer is appended to the risk report and gives carriers the comfort to bid
        tighter premiums.
      </p>

      <div className="mt-8">
        <OpenQuestionsPanel dealId={deal.id} questions={questions} mode="broker" />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-primary">What carriers already see</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The standard questions below are answered automatically from your submission package — no action needed.
          Items marked &ldquo;Refer to Deal Maker&rdquo; are where carriers are most likely to ask follow-ups.
        </p>
        <div className="mt-4">
          <UnderwritingBriefing items={briefing} />
        </div>
      </div>
    </div>
  );
}
