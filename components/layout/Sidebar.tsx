"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, LayoutGrid, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const SIDEBAR_ITEMS_BY_PORTAL: Record<"broker" | "carrier", SidebarItem[]> = {
  broker: [
    { href: "/deals", label: "Deal Pipeline", icon: LayoutGrid },
    { href: "/deals/new", label: "New Submission", icon: PlusCircle },
  ],
  carrier: [{ href: "/marketplace", label: "Deal Marketplace", icon: Gauge }],
};

export function Sidebar({ portal }: { portal: "broker" | "carrier" }) {
  const pathname = usePathname();
  const items = SIDEBAR_ITEMS_BY_PORTAL[portal];

  return (
    <nav className="flex w-60 shrink-0 flex-col gap-1 border-r border-border bg-white px-3 py-5">
      <p className="label-uppercase px-3 pb-2">Workspace</p>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-accent-tint text-accent shadow-[inset_3px_0_0_0_#0E6AED]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
