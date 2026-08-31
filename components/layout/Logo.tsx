import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, dark = true }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-1.5 font-semibold tracking-tight", className)}>
      <span className={cn("font-display text-[24px] font-semibold tracking-tight", dark ? "text-primary" : "text-white")}>Stoa</span>
      <span className="mb-1.5 inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
    </Link>
  );
}
