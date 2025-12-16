import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-sollar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-pm-terracotta text-white shadow-pm-md hover:bg-pm-terracotta-hover active:bg-pm-terracotta-active",
        secondary:
          "bg-pm-green-dark text-white shadow-pm-md hover:bg-pm-green-dark-hover active:bg-pm-green-dark-active",
        outline:
          "border border-border-default bg-white text-text-primary hover:bg-bg-secondary hover:shadow-pm-sm",
        ghost:
          "hover:bg-bg-secondary hover:text-text-primary",
        link: "text-pm-green-dark underline-offset-4 hover:underline hover:text-pm-green-dark-hover",
        destructive:
          "bg-risk-high text-white shadow-pm-md hover:bg-risk-high/90",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
