import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Pill chips, matching the button language. */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-accent text-accent-foreground",
        accent: "border-accent-border bg-accent-tint text-accent",
        primary: "border-transparent bg-primary text-primary-foreground",
        outline: "border-border text-primary",
        success: "border-success/25 bg-success-tint text-success",
        warning: "border-warning/25 bg-warning-tint text-warning",
        destructive: "border-destructive/25 bg-destructive-tint text-destructive",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
