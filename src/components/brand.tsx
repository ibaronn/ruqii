import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  source = "/logo.svg",
}: {
  className?: string;
  source?: string;
}) {
  return (
    <img
      src={source}
      alt=""
      aria-hidden="true"
      className={cn("h-8 w-8 shrink-0", className)}
      width="32"
      height="32"
    />
  );
}

export function Brand({
  size = "md",
  showWord = true,
  className,
}: {
  size?: "sm" | "md" | "lg";
  showWord?: boolean;
  className?: string;
}) {
  const mark = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const word =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <span className={cn("inline-flex select-none items-center gap-2.5", className)}>
      <BrandMark className={mark} />
      {showWord && (
        <span
          className={cn(
            "leading-none font-semibold tracking-[0.01em] text-ink",
            word
          )}
        >
          رُقي
        </span>
      )}
    </span>
  );
}