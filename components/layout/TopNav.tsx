import Link from "next/link";
import { Repeat } from "lucide-react";
import { Logo } from "./Logo";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "./SignOutButton";

interface TopNavProps {
  portalLabel: string;
  organizationName: string;
  userEmail: string;
  showRoleSwitch?: boolean;
}

export function TopNav({ portalLabel, organizationName, userEmail, showRoleSwitch = false }: TopNavProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-primary px-6">
      <div className="flex items-center gap-4">
        <Logo dark={false} />
        <span className="h-5 w-px bg-white/20" aria-hidden="true" />
        <span className="text-sm font-medium text-white/80">{portalLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        {showRoleSwitch && (
          <Link
            href="/choose-role"
            className="flex items-center gap-1.5 rounded-sm text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
            Switch Role
          </Link>
        )}
        <Badge variant="outline" className="border-white/20 text-white/80" title={userEmail}>
          {organizationName}
        </Badge>
        <span className="h-5 w-px bg-white/20" />
        <SignOutButton />
      </div>
    </header>
  );
}
