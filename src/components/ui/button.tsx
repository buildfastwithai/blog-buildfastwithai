import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer border border-border items-center rounded-xl justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[0.98] active:scale-[0.90]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary to-primary/60 text-background dark:text-foreground shadow-sm bg-foreground dark:bg-background",
        secondary:
          "bg-gradient-to-b from-secondary to-secondary/60 text-secondary-foreground shadow-sm",
        outline:
          "border border-border bg-transparent shadow-sm hover:bg-muted hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-0 focus-visible:ring-offset-0",
        menu: "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted underline-offset-4 focus-visible:ring-0 focus-visible:ring-offset-0",
        gradient:
          "bg-gradient-to-b from-primary to-primary/60 p-[2px] rounded-[12px]",
        secondary_light:
          "bg-gradient-to-b from-secondary-foreground to-secondary-foreground/80 text-accent bg-background",
        "3d": "border border-muted bg-muted px-6 text-foreground transition-all duration-100 [box-shadow:5px_5px_rgb(42_42_82)] hover:bg-muted/50 active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
