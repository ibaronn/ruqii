"use client";

import * as React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  children,
  labelledBy,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
  className?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full overflow-hidden glass-panel rounded-b-none outline-none sm:max-w-lg",
          "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "translate-y-0 scale-[1] opacity-100 sm:translate-y-0"
            : "translate-y-6 scale-[0.98] opacity-0 sm:translate-y-2",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function ModalHeader({
  title,
  onClose,
  className,
}: {
  title: string;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-white/50 px-6 py-4",
        className
      )}
    >
      <h3 className="text-lg font-medium">{title}</h3>
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="flex size-9 items-center justify-center rounded-lg text-ink/50 transition hover:bg-white/60 hover:text-ink"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}