import { formatPrice, percentOff } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PriceTag({
  priceCents,
  compareAtCents,
  size = "md",
  showOff = true,
  className,
}: {
  priceCents: number;
  compareAtCents?: number | null;
  size?: "sm" | "md" | "lg";
  showOff?: boolean;
  className?: string;
}) {
  const off =
    showOff && compareAtCents && compareAtCents > priceCents
      ? percentOff(priceCents, compareAtCents)
      : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-[17px]",
        className
      )}
    >
      <span className="font-semibold text-ink">{formatPrice(priceCents)}</span>
      {compareAtCents && compareAtCents > priceCents && (
        <span
          className={cn(
            "font-normal text-ink/35 line-through decoration-ink/30",
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          )}
        >
          {formatPrice(compareAtCents)}
        </span>
      )}
      {off && (
        <Badge tone="red" className="px-1.5 py-px text-[10px]">
          {off}%-
        </Badge>
      )}
    </div>
  );
}