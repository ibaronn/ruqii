"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyOrderNumber({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
    } catch {
      // ignore clipboard permission errors
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      className="flex size-8 items-center justify-center rounded-lg text-ink/40 transition hover:bg-white/70 hover:text-ink"
      aria-label="نسخ رقم الطلب"
      onClick={copy}
    >
      {copied ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  );
}

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      aria-label="طباعة"
      className="glass-soft inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-medium text-ink transition hover:text-ink active:scale-[0.985]"
    >
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" rx="1" />
      </svg>
      طباعة
    </button>
  );
}