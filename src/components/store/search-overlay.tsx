"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowLeft, Clock, Search, XCircle } from "lucide-react";
import type { ProductSummary } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { HeaderCategory } from "./header";

const RECENT_KEY = "ruqi_recent_searches";

export function SearchOverlay({
  open,
  onClose,
  categories = [],
}: {
  open: boolean;
  onClose: () => void;
  categories?: HeaderCategory[];
}) {
  const [mounted, setMounted] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ProductSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [recents, setRecents] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounce = React.useRef<number | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setSearched(false);
    try {
      setRecents(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {
      setRecents([]);
    }
    window.setTimeout(() => inputRef.current?.focus(), 60);
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

  const runSearch = React.useCallback(async (q: string, commit: boolean) => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/catalog?q=${encodeURIComponent(term)}&limit=6`);
      const data = await res.json();
      setResults(Array.isArray(data.products) ? data.products : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
    if (commit) commitRecent(term);
  }, []);

  const commitRecent = (term: string) => {
    setRecents((prev) => {
      const next = [term, ...prev.filter((t) => t !== term)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const onInput = (value: string) => {
    setQuery(value);
    if (debounce.current) window.clearTimeout(debounce.current);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    debounce.current = window.setTimeout(() => runSearch(value, false), 250);
  };

  const submit = () => runSearch(query, true);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cnOverlay(open)}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-x-0 top-0 px-3 pt-3 sm:px-5 sm:pt-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="بحث"
          className={cnPanel(open)}
        >
          <div className="border-b border-white/50">
            <div className="flex items-center gap-3 px-5 py-4 sm:px-7">
              <Search className="size-5 shrink-0 text-ink/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="ابحث عن منتجات رُقي…"
                aria-label="بحث عن المنتجات"
                className="h-11 w-full bg-transparent text-lg text-ink outline-none placeholder:text-ink/30"
                dir="rtl"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onInput("")}
                  aria-label="مسح البحث"
                  className="flex size-8 shrink-0 items-center justify-center rounded-sm text-ink/40 hover:text-ink"
                >
                  <XCircle className="size-5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto px-5 py-4 sm:px-7">
            {!query && (
              <div className="space-y-6">
                {recents.length > 0 && (
                  <div>
                    <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-ink/40">
                      عمليات بحث سابقة
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recents.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setQuery(r);
                            onInput(r);
                          }}
                          className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink/70 transition hover:text-ink"
                        >
                          <Clock className="size-3.5" />
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {categories.length > 0 && (
                  <div>
                    <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-ink/40">
                      تصفح حسب التصنيف
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/products?category=${c.slug}`}
                          onClick={onClose}
                          className="glass-soft rounded-full px-3.5 py-1.5 text-sm text-ink/70 transition hover:bg-ink hover:text-white"
                        >
                          {c.nameAr}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {recents.length === 0 && categories.length === 0 && (
                  <p className="py-6 text-center text-sm text-ink/45">
                    ابدأ الكتابة للبحث عن المنتجات
                  </p>
                )}
              </div>
            )}

            {query && loading && (
              <div className="space-y-3 py-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="size-14 shrink-0 rounded-sm" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query && !loading && searched && results.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink/40">
                  النتائج ({results.length})
                </p>
                <ul className="divide-y divide-white/40">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-4 py-3"
                      >
                        <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-white/50">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.nameAr}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-ink/25">
                              رُقي
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="trim-lines line-1 text-[15px] font-medium text-ink group-hover:text-ink/70">
                            {p.nameAr}
                          </p>
                          <p className="mt-0.5 text-sm text-ink/50">
                            {formatPrice(p.priceCents)}
                          </p>
                        </div>
                        <ArrowLeft className="size-4 text-ink/25 transition group-hover:text-ink" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {query && !loading && searched && results.length === 0 && (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-stone-faint">
                  <Search className="size-5 text-ink/35" />
                </div>
                <p className="text-[15px] font-medium text-ink">لم نجد منتجات مطابقة</p>
                <p className="mt-1 text-sm text-ink/50">جرّب كلمات أخرى أو تصفح التصنيفات</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function cnOverlay(open: boolean) {
  return [
    "fixed inset-0 z-[95] transition-colors duration-300",
    open ? "pointer-events-auto bg-ink/10" : "pointer-events-none bg-transparent",
  ].join(" ");
}

function cnPanel(open: boolean) {
  return [
    "glass-panel mx-auto w-full max-w-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    open
      ? "translate-y-0 opacity-100"
      : "-translate-y-3 opacity-0",
  ].join(" ");
}