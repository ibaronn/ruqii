import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

type Variant = "solid" | "outline" | "ghost" | "soft" | "danger" | "success";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}

const variantClasses: Record<Variant, string> = {
  solid:
    "glass-dark hover:-translate-y-px hover:shadow-[0_18px_36px_-16px_rgba(0,0,0,0.6)] active:translate-y-0 active:scale-[0.98]",
  outline:
    "glass-soft text-ink hover:-translate-y-px hover:bg-ink hover:text-white hover:shadow-[0_16px_34px_-16px_rgba(0,0,0,0.5)] active:translate-y-0 active:scale-[0.98]",
  ghost: "bg-transparent text-ink hover:bg-white/60 active:scale-[0.98]",
  soft: "glass-soft text-ink hover:-translate-y-px hover:text-ink hover:shadow-[0_16px_32px_-18px_rgba(30,24,16,0.4)] active:translate-y-0 active:scale-[0.98]",
  danger:
    "border border-red-200/70 bg-red-50/70 text-red-700 backdrop-blur-md hover:-translate-y-px hover:bg-red-100/80 hover:shadow-[0_16px_32px_-16px_rgba(220,38,38,0.5)] active:translate-y-0 active:scale-[0.98]",
  success:
    "border border-emerald-500/20 bg-emerald-600/90 text-white backdrop-blur-md hover:-translate-y-px hover:bg-emerald-700 hover:shadow-[0_16px_32px_-16px_rgba(5,150,105,0.55)] active:translate-y-0 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-6 text-[15px] gap-2",
  lg: "h-[52px] px-8 text-base gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "solid", size = "md", loading, full, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex select-none items-center justify-center rounded-xl font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-45",
          variantClasses[variant],
          sizeClasses[size],
          full && "w-full",
          className
        )}
        {...props}
      >
        {loading && <Spinner className="size-4" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";