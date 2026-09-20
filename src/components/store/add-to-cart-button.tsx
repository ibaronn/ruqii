"use client";

import * as React from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useStore } from "./store-provider";
import type { CartItemPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export function AddToCartButton({
  product,
  variant = "overlay",
  className,
}: {
  product: CartItemPayload;
  variant?: "overlay" | "solid" | "outline" | "icon";
  className?: string;
}) {
  const { add } = useStore();
  const [state, setState] = React.useState<"idle" | "added" | "loading">("idle");
  const timer = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const outOfStock = product.stock <= 0;

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || state === "loading") return;
    setState("loading");
    window.setTimeout(() => {
      add(product);
      setState("added");
      timer.current = window.setTimeout(() => setState("idle"), 1600);
    }, 90);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={outOfStock}
        aria-label={outOfStock ? "غير متوفر" : "أضف إلى السلة"}
        className={cn(
          "flex size-10 items-center justify-center rounded-full bg-white/85 text-ink shadow-[0_1px_6px_rgba(0,0,0,0.14)] backdrop-blur-md transition-all duration-200",
          "hover:bg-ink hover:text-white active:scale-95",
          state === "added" && "bg-emerald-600 text-white",
          outOfStock && "cursor-not-allowed opacity-55",
          className
        )}
      >
        {state === "added" ? (
          <Check className="size-4.5" />
        ) : outOfStock ? (
          <ShoppingBag className="size-4.5" />
        ) : (
          <ShoppingBag className="size-4.5" />
        )}
      </button>
    );
  }

  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.98]";
  const variants = {
    overlay:
      "glass-soft h-11 text-ink hover:bg-ink hover:text-white disabled:opacity-60",
    solid:
      "h-12 bg-ink text-white hover:bg-[#2b2b2b] text-[15px] disabled:opacity-45",
    outline:
      "glass-soft h-12 border-transparent text-ink hover:bg-ink hover:text-white text-[15px] disabled:opacity-45",
  } as const;

  return (
    <button
      type="button"
      onClick={handle}
      disabled={outOfStock || state === "loading"}
      className={cn(
        base,
        variants[variant === "overlay" ? "overlay" : variant],
        state === "added" && "bg-emerald-600 text-white hover:bg-emerald-600",
        className
      )}
    >
      {state === "loading" ? (
        <Spinner className="size-4" />
      ) : state === "added" ? (
        <>
          <Check className="size-4" />
          أُضيف إلى السلة
        </>
      ) : outOfStock ? (
        "غير متوفر حاليًا"
      ) : (
        <>
          <ShoppingBag className="size-4" />
          أضف إلى السلة
        </>
      )}
    </button>
  );
}