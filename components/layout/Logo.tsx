import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, dark = true }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-1.5 font-semibold tracking-tight", className)}>
      <span className={cn("text-xl", dark ? "text-primary" : "text-white")}>Stoa</span>
      <span className="mb-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
    </Link>
  );
}
