"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  size = "md",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const btn = cn(
    "flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-white/60 active:scale-90 disabled:opacity-40 disabled:hover:bg-transparent",
    size === "md" ? "size-10" : "size-8"
  );
  return (
    <div
      className={cn(
        "glass-soft inline-flex items-center justify-between rounded-xl",
        size === "md" ? "h-11 w-[130px] px-1" : "h-9 w-[108px] px-1",
        className
      )}
    >
      <button
        type="button"
        className={btn}
        aria-label="زيادة الكمية"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="size-4" />
      </button>
      <span
        className={cn(
          "tabular-nums font-medium",
          size === "md" ? "text-[15px]" : "text-sm"
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        aria-label="إنقاص الكمية"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="size-4" />
      </button>
    </div>
  );
}