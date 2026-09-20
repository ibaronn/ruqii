"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onClose,
  children,
  side = "left",
  labelledBy,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
  labelledBy?: string;
  className?: string;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]" aria-hidden={!open}>
      <button
        type="button"
        aria-label="إغلاق"
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/30 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "absolute inset-y-3 flex w-[calc(100%-1.5rem)] max-w-md flex-col overflow-hidden glass-panel",
          "transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          side === "left" ? "left-3" : "right-3",
          open
            ? "translate-x-0"
            : side === "left"
              ? "-translate-x-[115%]"
              : "translate-x-[115%]",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}