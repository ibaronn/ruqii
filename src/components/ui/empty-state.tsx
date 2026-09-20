import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-20 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-stone-faint text-ink/45">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-ink">{title}</h3>
      {subtitle && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink/55">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}