import { Check, PackageCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  key: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

export const ORDER_STEPS: Step[] = [
  {
    key: "APPROVED",
    icon: <Check className="size-4" />,
    title: "تمت الموافقة على الطلب",
    description: "تم استلام طلبك وتأكيده من فريقنا.",
  },
  {
    key: "SHIPPING",
    icon: <Truck className="size-4" />,
    title: "قيد الشحن",
    description: "طلبك في الطريق إليك الآن.",
  },
  {
    key: "DELIVERED",
    icon: <PackageCheck className="size-4" />,
    title: "تم التوصيل",
    description: "تم تسليم طلبك بنجاح.",
  },
];

export function OrderTimeline({
  stepIndex,
  className,
}: {
  stepIndex: number;
  className?: string;
}) {
  const current = Math.max(0, Math.min(stepIndex, ORDER_STEPS.length - 1));

  return (
    <ol
      className={cn("relative flex flex-col gap-8", className)}
      aria-label="حالة الطلب"
    >
      <div
        aria-hidden="true"
        className="absolute start-[19px] top-6 bottom-6 w-px bg-stone-line"
      />
      <div
        aria-hidden="true"
        className="absolute start-[19px] top-6 w-px bg-emerald-500 transition-[height] duration-700 ease-out"
        style={{ height: `${((current + 1) / ORDER_STEPS.length) * 100}%` }}
      />

      {ORDER_STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <li key={step.key} className="relative flex items-start gap-4">
            <span
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500",
                done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : active
                    ? "border-amber-400 bg-white text-amber-500"
                    : "border-white/60 bg-white/60 text-ink/30"
              )}
            >
              {active && !done ? (
                <span className="size-2 animate-ping rounded-full bg-amber-400" />
              ) : (
                step.icon
              )}
            </span>
            <div className="pt-0.5">
              <p
                className={cn(
                  "text-[15px] font-semibold transition-colors",
                  done ? "text-ink" : active ? "text-amber-600" : "text-ink/40"
                )}
              >
                {step.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink/50">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}