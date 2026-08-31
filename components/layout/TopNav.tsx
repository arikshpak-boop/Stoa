import Link from "next/link";
import { Repeat } from "lucide-react";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";
import { BackButton } from "./BackButton";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  portalLabel: string;
  organizationName: string;
  userEmail: string;
  showRoleSwitch?: boolean;
  primaryAction?: { href: string; label: string };
}

export function TopNav({
  portalLabel,
  organizationName,
  userEmail,
  showRoleSwitch = false,
  primaryAction,
}: TopNavProps) {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-white px-6">
      <div className="flex items-center gap-4">
        <Logo />
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <BackButton />
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <span className="text-sm font-medium text-muted-foreground">{portalLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        {showRoleSwitch && (
          <Link
            href="/choose-role"
            className="flex items-center gap-1.5 rounded-md text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
            Switch Role
          </Link>
        )}
        {primaryAction && (
          <Button size="sm" asChild>
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
        )}
        <span
          className="rounded-full border border-accent-border bg-accent-tint px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent"
          title={userEmail}
        >
          {organizationName}
        </span>
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <SignOutButton variant="light" />
      </div>
    </header>
  );
}
