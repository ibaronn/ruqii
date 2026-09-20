import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "glass-soft min-h-32 w-full rounded-xl px-4 py-3 text-[15px] leading-relaxed text-ink transition-all duration-200",
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
        {error && (
          <p className="mt-1.5 text-[12px] leading-snug text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";