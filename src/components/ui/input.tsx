import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          className={cn(
            "glass-soft h-12 w-full rounded-xl px-4 text-[15px] text-ink transition-all duration-200",
            "placeholder:text-ink/35",
            "focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/10",
            "disabled:cursor-not-allowed disabled:bg-white/40 disabled:opacity-60",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : "hover:border-white/80",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-[12px] leading-snug text-ink/45">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-[12px] leading-snug text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";