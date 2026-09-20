"use client";

import { createPortal } from "react-dom";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useStore } from "@/components/store/store-provider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const icons = {
  success: <CheckCircle2 className="size-[18px] text-emerald-600" />,
  error: <XCircle className="size-[18px] text-red-600" />,
  info: <Info className="size-[18px] text-ink" />,
};

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[120] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 sm:bottom-6"
      role="region"
      aria-live="polite"
      aria-label="الإشعارات"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismissToast(t.id)}
          className={cn(
            "glass-soft pointer-events-auto flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-start",
            "animate-fade-up"
          )}
        >
          {icons[t.type]}
          <span className="text-sm text-ink">{t.message}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}