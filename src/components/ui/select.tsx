import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "glass-soft h-12 w-full appearance-none rounded-xl px-4 text-[15px] text-ink transition-all duration-200",
              "focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/10",
              "disabled:cursor-not-allowed disabled:bg-white/40 disabled:opacity-60",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                : "hover:border-white/80",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
        </div>
        {error && (
          <p className="mt-1.5 text-[12px] leading-snug text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";