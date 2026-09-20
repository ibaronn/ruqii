import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "dark" | "green" | "yellow" | "blue" | "red";
}) {
  const tones = {
    neutral: "border border-white/60 bg-white/55 text-ink/70",
    dark: "glass-dark",
    green: "border border-emerald-100/70 bg-emerald-50/70 text-emerald-700",
    yellow: "border border-amber-100/70 bg-amber-50/70 text-amber-700",
    blue: "border border-sky-100/70 bg-sky-50/70 text-sky-700",
    red: "border border-red-100/70 bg-red-50/70 text-red-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium leading-5 backdrop-blur-md",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}