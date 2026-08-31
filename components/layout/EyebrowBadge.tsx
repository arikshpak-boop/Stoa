import { cn } from "@/lib/utils";

interface EyebrowBadgeProps {
  children: React.ReactNode;
  dotColor?: "success" | "accent";
  className?: string;
}

export function EyebrowBadge({ children, dotColor = "success", className }: EyebrowBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground shadow-card",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor === "success" ? "bg-success" : "bg-accent")} aria-hidden="true" />
      {children}
    </span>
  );
}
