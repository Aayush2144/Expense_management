import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] transition-transform",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border/60 bg-background/50 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    if (variant === "glow") {
      return (
        <button
          ref={ref}
          className={cn(
            "relative inline-flex items-center justify-center p-[1.5px] rounded-full overflow-hidden group shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] active:scale-[0.98] transition-all cursor-pointer",
            className
          )}
          {...props}
        >
          {/* Animated revolving neon border beam */}
          <div
            className="absolute inset-[-200%] animate-[spin_3s_linear_infinite]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg 160deg, #00F0FF 240deg, #8B5CF6 290deg, #EC4899 330deg, #00F0FF 360deg)",
            }}
          />
          <div
            className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] blur-sm opacity-80"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg 160deg, #00F0FF 240deg, #8B5CF6 290deg, #EC4899 330deg, #00F0FF 360deg)",
            }}
          />
          {/* 100% Solid Opaque Button Body: Light stays strictly on the perimeter */}
          <span className="relative z-10 inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#0A0D14] dark:bg-[#0A0D14] text-foreground text-xs font-semibold w-full h-full group-hover:bg-[#141926] transition-colors">
            {children}
          </span>
        </button>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
