"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";

type CategoryOption = { slug: string; nameAr: string; count: number };

const SORTS = [
  { value: "featured", label: "الأكثر تميزًا" },
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "السعر: من الأقل" },
  { value: "price-desc", label: "السعر: من الأعلى" },
] as const;

export function ProductsToolbar({
  categories,
  total,
}: {
  categories: CategoryOption[];
  total: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const category = sp.get("category") ?? "";
  const sort = sp.get("sort") ?? "featured";
  const inStock = sp.get("inStock") === "true";
  const minSar = sp.get("min") ?? "";
  const maxSar = sp.get("max") ?? "";

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `/products?${qs}` : "/products", { scroll: false });
    },
    [router, sp]
  );

  const activeFilterCount =
    (inStock ? 1 : 0) + (minSar ? 1 : 0) + (maxSar ? 1 : 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="glass-soft inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm text-ink transition hover:text-ink lg:hidden"
          aria-label="فلاتر وبحث"
        >
          <SlidersHorizontal className="size-4" />
          فلاتر
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="no-scrollbar -mx-shell flex w-[calc(100%+2*var(--shell-pad))] items-center gap-1.5 overflow-x-auto px-shell lg:mx-0 lg:w-auto lg:px-0">
          <Pill active={!category} onClick={() => setParams({ category: null })}>
            الكل
          </Pill>
          {categories.map((c) => (
            <Pill
              key={c.slug}
              active={category === c.slug}
              onClick={() =>
                setParams({ category: category === c.slug ? null : c.slug })
              }
            >
              {c.nameAr}
            </Pill>
          ))}
        </div>
      </div>

      <div className="mt-4 hidden items-center justify-between gap-4 lg:flex">
        <p className="text-sm text-ink/50">{total} منتج</p>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setParams({ inStock: e.target.checked ? "true" : null })}
              className="size-4 accent-black"
            />
            المتوفر فقط
          </label>
          <select
            value={sort}
            onChange={(e) => setParams({ sort: e.target.value })}
            className="glass-soft h-10 cursor-pointer rounded-xl px-3 text-sm text-ink outline-none transition hover:text-ink focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 lg:hidden">
        <p className="text-sm text-ink/50">{total} منتج</p>
        <div className="no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto">
          <select
            value={sort}
            onChange={(e) => setParams({ sort: e.target.value })}
            className="glass-soft h-10 cursor-pointer rounded-xl px-3 text-sm text-ink outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="left"
        labelledBy="filter-drawer-title"
      >
        <div className="flex items-center justify-between border-b border-white/50 px-5 py-4">
          <h2 id="filter-drawer-title" className="text-lg font-medium">
            الفلاتر
          </h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="إغلاق الفلاتر"
            className="flex size-9 items-center justify-center rounded-lg text-ink/50 transition hover:bg-white/60 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-ink/45">
            التصنيف
          </h3>
          <ul className="space-y-1">
            {[
              { slug: "", nameAr: "الكل" },
              ...categories,
            ].map((c) => (
              <li key={c.slug || "all"}>
                <button
                  type="button"
                  onClick={() => {
                    setParams({ category: c.slug || null });
                    setDrawerOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] transition",
                    category === c.slug
                      ? "bg-ink font-medium text-white"
                      : "text-ink hover:bg-white/60"
                  )}
                >
                  <span>{c.nameAr}</span>
                  {"count" in c && (
                    <span
                      className={cn(
                        "text-xs",
                        category === c.slug ? "text-white/60" : "text-ink/40"
                      )}
                    >
                      {c.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <h3 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-wider text-ink/45">
            السعر (د.ل)
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="من"
              aria-label="أقل سعر"
              defaultValue={minSar}
              className="glass-soft h-11 w-full rounded-xl px-3 text-sm outline-none focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setParams({ min: (e.target as HTMLInputElement).value });
                }
              }}
              onBlur={(e) => setParams({ min: e.target.value })}
            />
            <span className="text-ink/35">—</span>
            <input
              type="number"
              min={0}
              placeholder="إلى"
              aria-label="أعلى سعر"
              defaultValue={maxSar}
              className="glass-soft h-11 w-full rounded-xl px-3 text-sm outline-none focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setParams({ max: (e.target as HTMLInputElement).value });
                }
              }}
              onBlur={(e) => setParams({ max: e.target.value })}
            />
          </div>

          <label className="glass-soft mt-8 flex cursor-pointer select-none items-center justify-between rounded-xl px-4 py-3.5 text-[15px]">
            <span>المتوفر فقط</span>
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) =>
                setParams({ inStock: e.target.checked ? "true" : null })
              }
              className="size-4 accent-black"
            />
          </label>
        </div>

        <div className="border-t border-white/50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setParams({
                  category: null,
                  min: null,
                  max: null,
                  inStock: null,
                });
              }}
              className="glass-soft h-11 rounded-xl text-sm font-medium text-ink transition hover:text-ink"
            >
              مسح الكل
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="h-11 rounded-xl bg-ink text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition hover:bg-[#1f1f1f]"
            >
              عرض النتائج
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm transition-all duration-200",
        active
          ? "border border-transparent bg-ink font-medium text-white shadow-[0_10px_22px_-12px_rgba(0,0,0,0.6)]"
          : "glass-soft text-ink/70 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}