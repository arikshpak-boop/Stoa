"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileText,
  HelpCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { roleHomePath, type UserRole } from "@/lib/session";
import { cn } from "@/lib/utils";

interface RoleOption {
  role: UserRole;
  icon: typeof Briefcase;
  title: string;
  subtitle: string;
  description: string;
  stats: Array<{ label: string; value: string; icon: typeof FileText }>;
  capabilities: string[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "Broker",
    icon: Briefcase,
    title: "Deal Maker",
    subtitle: "PE Firms · M&A Advisors · Legal Counsel",
    description: "Upload deals, manage due diligence, and access competitive carrier bids.",
    stats: [
      { label: "Avg. Documents", value: "1,200+", icon: FileText },
      { label: "Time Saved", value: "67%", icon: ArrowRight },
      { label: "Carrier Bids", value: "15-20", icon: ShieldCheck },
    ],
    capabilities: [
      "Upload VDR and deal documents",
      "AI-powered warranty analysis",
      "Invite carriers to bid",
      "Track pipeline and metrics",
      "Compare carrier proposals",
      "Manage multiple deals",
    ],
  },
  {
    role: "Carrier",
    icon: ShieldCheck,
    title: "Insurance Carrier",
    subtitle: "W&I Insurance Providers",
    description: "Browse opportunities, review AI risk reports, and submit competitive bids.",
    stats: [
      { label: "Avg. Win Rate", value: "32%", icon: ArrowRight },
      { label: "Premium Saved", value: "18%", icon: ShieldCheck },
      { label: "Active Deals", value: "45+", icon: FileText },
    ],
    capabilities: [
      "Browse qualified opportunities",
      "Access AI risk assessments",
      "Review VDR documents",
      "Submit competitive bids",
      "Track active proposals",
      "Portfolio analytics",
    ],
  },
];

export function ChooseRoleContent({ organizationName }: { organizationName: string }) {
  const router = useRouter();
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  function handleContinue(role: UserRole) {
    setPendingRole(role);
    router.push(roleHomePath(role));
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <Badge variant="primary" className="mb-4">
          Welcome
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Choose Your Role</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Select how you&apos;ll be using the platform as <span className="font-medium text-primary">{organizationName}</span>.
          You can switch between roles anytime from your account settings.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {ROLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isPending = pendingRole === option.role;
          return (
            <Card key={option.role} className="flex flex-col border-border">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-primary">{option.title}</p>
                    <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5">
                <p className="text-sm text-muted-foreground">{option.description}</p>

                <div className="grid grid-cols-3 gap-2">
                  {option.stats.map((stat) => (
                    <div key={stat.label} className="rounded-md bg-muted px-2 py-3 text-center">
                      <p className="text-sm font-semibold text-primary">{stat.value}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <ul className="flex-1 space-y-2">
                  {option.capabilities.map((capability) => (
                    <li key={capability} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                      {capability}
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn("w-full", option.role === "Broker" && "bg-primary hover:bg-secondary")}
                  disabled={pendingRole !== null}
                  onClick={() => handleContinue(option.role)}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entering…
                    </>
                  ) : (
                    <>
                      Continue as {option.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 border-border bg-white">
        <CardContent className="flex flex-wrap items-center gap-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <HelpCircle className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">Need Help Choosing?</p>
            <p className="text-xs text-muted-foreground">
              Not sure which role fits you best? Our team can help you get started with the right workflow for your
              organization.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" type="button">
              Schedule Onboarding Call
            </Button>
            <Button variant="ghost" size="sm" type="button">
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
