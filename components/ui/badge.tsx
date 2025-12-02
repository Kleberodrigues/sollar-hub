import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-sollar focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-bg-secondary text-text-primary",
        success:
          "border-risk-low-border bg-risk-low-bg text-risk-low",
        warning:
          "border-risk-medium-border bg-risk-medium-bg text-risk-medium",
        danger:
          "border-risk-high-border bg-risk-high-bg text-risk-high",
        outline: "border-border-default text-text-primary",
        "risk-low":
          "border-risk-low-border bg-risk-low-bg text-risk-low",
        "risk-medium":
          "border-risk-medium-border bg-risk-medium-bg text-risk-medium",
        "risk-high":
          "border-risk-high-border bg-risk-high-bg text-risk-high",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
