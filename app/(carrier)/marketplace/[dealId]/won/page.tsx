import { notFound } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  FileBarChart2,
  FileCheck2,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getDealStore } from "@/lib/mock-store";
import { getServerSession } from "@/lib/get-session";
import { canCarrierSeeDeal } from "@/lib/carriers";
import { formatCurrency } from "@/lib/premium";
import { formatDate } from "@/lib/utils";
import { mockContactEmail, mockContactName, mockContactPhone, mockIndexForId } from "@/lib/kpi";
import { policyEffectiveDate, policyExpiryDate, policyNumber, policyTermYears } from "@/lib/policy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrintConfirmationButton } from "./PrintConfirmationButton";

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const DOCUMENTS = [
  { label: "Winning Bid Confirmation", meta: "PDF · 245 KB" },
  { label: "Policy Schedule & Terms", meta: "PDF · 1.8 MB" },
  { label: "Premium Payment Instructions", meta: "PDF · 156 KB" },
  { label: "Risk Assessment Report", meta: "PDF · 4.2 MB" },
  { label: "Warranty Coverage Matrix", meta: "PDF · 890 KB" },
  { label: "Deal Summary & VDR Index", meta: "PDF · 3.1 MB" },
];

export default async function WonBidPage({ params }: { params: { dealId: string } }) {
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

  const myBid = deal.bids.find((bid) => bid.carrierName === session.organizationName && bid.bidStatus === "Accepted");

  if (!myBid) {
    notFound();
  }

  const effectiveDate = policyEffectiveDate(deal);
  const expiryDate = policyExpiryDate(deal);
  const contactIndex = mockIndexForId(deal.id);
  const contactName = mockContactName(contactIndex);

  const nextSteps = [
    {
      icon: FileCheck2,
      title: "Policy Documentation",
      description: "Review and sign the final insurance policy documents.",
      due: addDays(effectiveDate, -14),
      cta: "Review Documents",
    },
    {
      icon: FileBarChart2,
      title: "Premium Payment",
      description: `Process premium payment of ${formatCurrency(myBid.premiumTotal, deal.financials.currency)} via wire transfer.`,
      due: addDays(effectiveDate, -10),
      cta: "Payment Instructions",
    },
    {
      icon: Users,
      title: "Deal Maker Coordination",
      description: `Schedule alignment call with ${deal.organizationName} team.`,
      due: addDays(effectiveDate, -16),
      cta: "Schedule Call",
    },
    {
      icon: CalendarClock,
      title: "Policy Activation",
      description: "Final policy activation and coverage confirmation.",
      due: effectiveDate,
      cta: "View Timeline",
      scheduled: true,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-8 py-10 print:px-0">
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
          </div>
          <Badge variant="success">Bid Accepted</Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Congratulations! You Won the Bid</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Your proposal for <span className="font-semibold text-primary">{deal.target.companyName}</span> has been
            selected. The deal maker has accepted your premium of{" "}
            <span className="font-semibold text-primary">{formatCurrency(myBid.premiumTotal, deal.financials.currency)}</span>{" "}
            for <span className="font-semibold text-primary">{formatCurrency(myBid.limitAmount, deal.financials.currency)}</span>{" "}
            coverage.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3 print:hidden">
            <Button variant="outline" disabled title="Coming soon">
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Download All Documents
            </Button>
            <PrintConfirmationButton />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Your Premium</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
              {formatCurrency(myBid.premiumTotal, deal.financials.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Coverage Amount</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
              {formatCurrency(myBid.limitAmount, deal.financials.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Premium Rate</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-primary">{myBid.rateOnLinePercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Policy Term</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-primary">{policyTermYears()} Years</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>Complete these actions to finalize the insurance policy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextSteps.map((step) => (
                <div
                  key={step.title}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <step.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-primary">{step.title}</p>
                        <Badge variant={step.scheduled ? "muted" : "primary"} className="text-[10px]">
                          {step.scheduled ? "Scheduled" : "Action Required"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        Due {formatDate(step.due)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant={step.scheduled ? "outline" : "default"} disabled title="Coming soon">
                    {step.cta}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Documents</CardTitle>
              <CardDescription>Download policy documents and deal materials.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DOCUMENTS.map((doc) => (
                <div key={doc.label} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-primary">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">{doc.meta}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" disabled title="Coming soon">
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                Deal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Deal Name</p>
                <p className="font-medium text-primary">{deal.target.companyName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Sector</p>
                <p className="font-medium text-primary">{deal.target.sector}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Deal Value</p>
                <p className="font-medium text-primary">{formatCurrency(deal.financials.enterpriseValue, deal.financials.currency)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Policy Number</p>
                <p className="font-mono font-medium text-primary">{policyNumber(deal, myBid)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Effective Date</p>
                <p className="font-medium text-primary">{formatDate(effectiveDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Expiry Date</p>
                <p className="font-medium text-primary">{formatDate(expiryDate)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deal Maker</CardTitle>
              <CardDescription>Primary Contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Firm</p>
                <p className="font-medium text-primary">{deal.organizationName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Contact Person</p>
                <p className="font-medium text-primary">{contactName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="flex items-center gap-1.5 font-medium text-primary">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  {mockContactEmail(contactName, deal.organizationName)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
                <p className="flex items-center gap-1.5 font-medium text-primary">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  {mockContactPhone(contactIndex)}
                </p>
              </div>
              <Button className="w-full" disabled title="Coming soon">
                <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8 border-accent/20 bg-accent/5 print:hidden">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Important Reminder:</span> to activate your policy coverage,
              all required documents must be signed and premium payment must be received by{" "}
              <span className="font-medium text-primary">{formatDate(addDays(effectiveDate, -10))}</span>. Policy coverage
              will become effective on <span className="font-medium text-primary">{formatDate(effectiveDate)}</span>.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button disabled title="Coming soon">Complete Policy Activation</Button>
            <Button variant="outline" disabled title="Coming soon">Contact Support</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
