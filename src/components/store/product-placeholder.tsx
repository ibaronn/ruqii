import { cn } from "@/lib/utils";

export function ProductPlaceholder({
  className,
  name,
  asIcon = true,
}: {
  className?: string;
  name?: string;
  asIcon?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-white/40",
        className
      )}
      role="img"
      aria-label={name ? `صورة قادمة قريبًا — ${name}` : "صورة المنتج قادمة قريبًا"}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(10,10,10,0.045) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      {asIcon && (
        <div className="relative flex flex-col items-center gap-3 px-4 text-center">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-12 w-12 opacity-[0.12]"
          />
          <span className="text-[11px] font-medium tracking-wide text-ink/30">
            {name ? name : "صورة المنتج"}
          </span>
        </div>
      )}
    </div>
  );
}