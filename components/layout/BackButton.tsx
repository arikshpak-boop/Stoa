"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBackHref } from "@/lib/navigation";

export function BackButton() {
  const pathname = usePathname();
  const backHref = getBackHref(pathname);

  return (
    <Link
      href={backHref}
      className="flex items-center gap-1.5 rounded-md text-sm font-semibold text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </Link>
  );
}
