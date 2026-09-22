"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StoreScroll() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0 });

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        setProgress(max > 0 ? (doc.scrollTop / max) * 100 : 0);
        setShowTop(doc.scrollTop > 480);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-[60] h-[2.5px] bg-transparent"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-bronze-deep via-bronze to-bronze-pale transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="العودة للأعلى"
        className={cn(
          "glass-bar fixed bottom-5 end-5 z-[60] flex size-11 items-center justify-center rounded-full text-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          showTop
            ? "translate-y-0 opacity-100 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-16px_rgba(30,24,16,0.5)]"
            : "pointer-events-none translate-y-4 opacity-0",
          "active:scale-95"
        )}
      >
        <ArrowUp className="size-5" />
      </button>
    </>
  );
}