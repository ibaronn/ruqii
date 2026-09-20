"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  isActive: boolean;
};

type Product = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string | null;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryNameAr?: string;
  image?: string | null;
};

type Page = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 10;

export function ProductsView() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [categoryId, setCategoryId] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Page | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setCategories(d.categories as Category[]))
      .catch(() => setCategories([]));
  }, []);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const load = React.useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      status,
    });
    if (categoryId !== "all") params.set("category", categoryId);
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    fetch(`/api/admin/products?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData(null));
  }, [page, status, categoryId, debouncedQ]);

  React.useEffect(() => {
    setPage(1);
  }, [status, categoryId, debouncedQ]);

  React.useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id: string, patch: Record<string, unknown>) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) load();
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/45">
            لوحة التحكم
          </p>
          <h1 className="mt-2 text-3xl font-medium">المنتجات</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center gap-2 rounded-none bg-ink px-6 text-[15px] font-medium text-white transition active:scale-[0.985]"
        >
          <Plus className="size-4" />
          إضافة منتج
        </Link>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="ps-10"
            placeholder="بحث بالاسم أو المعرّف…"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="sm:w-40"
        >
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">معطّل</option>
        </Select>
        <Select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="sm:w-48"
        >
          <option value="all">كل التصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameAr}
            </option>
          ))}
        </Select>
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-start text-sm">
            <thead>
              <tr className="border-b border-white/50 bg-white/40 text-[12px] uppercase tracking-wider text-ink/45">
                <th className="px-4 py-3 text-start font-medium">المنتج</th>
                <th className="px-4 py-3 text-start font-medium">السعر</th>
                <th className="px-4 py-3 text-start font-medium">المخزون</th>
                <th className="px-4 py-3 text-start font-medium">التصنيف</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">مميز</th>
                <th className="px-4 py-3 text-end font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {!data &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-6">
                      <div className="skeleton h-6 w-full" />
                    </td>
                  </tr>
                ))}
              {data?.products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-ink/45">
                    لا توجد منتجات مطابقة للبحث.
                  </td>
                </tr>
              )}
              {data?.products.map((p) => (
                <tr key={p.id} className="hover:bg-bone-warm/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-sm bg-bone-soft">
                        {p.image ? (
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-ink/25">
                            رُقي
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="trim-lines line-1 block font-medium hover:underline"
                        >
                          {p.nameAr}
                        </Link>
                        <p className="trim-lines line-1 text-[12px] tabular-nums text-ink/45">
                          {p.nameEn && <span dir="ltr">{p.nameEn}</span>}
                          {p.nameEn ? " · " : ""}
                          {p.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className="font-medium">{formatPrice(p.priceCents)}</span>
                    {p.compareAtCents && (
                      <span className="ms-1.5 text-[12px] text-ink/40 line-through">
                        {formatPrice(p.compareAtCents)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "tabular-nums",
                        p.stock === 0
                          ? "font-medium text-red-600"
                          : p.stock <= 5
                            ? "font-medium text-amber-600"
                            : "text-ink/70"
                      )}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{p.categoryNameAr}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => toggle(p.id, { isActive: !p.isActive })}
                    >
                      <Badge tone={p.isActive ? "green" : "red"}>
                        {p.isActive ? "نشط" : "معطّل"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => toggle(p.id, { isFeatured: !p.isFeatured })}
                      aria-label={p.isFeatured ? "إزالة من المميز" : "إضافة للمميز"}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-sm transition",
                        p.isFeatured
                          ? "text-amber-500"
                          : "text-ink/25 hover:bg-stone-faint hover:text-ink/60"
                      )}
                    >
                      <Star className="size-4" fill={p.isFeatured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[13px] font-medium text-ink/70 transition hover:bg-stone-faint hover:text-ink"
                    >
                      <Pencil className="size-3.5" />
                      تعديل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/50 px-4 py-3">
            <p className="text-[13px] text-ink/55 tabular-nums">
              {data.total} منتجًا
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                السابق
              </Button>
              <span className="px-1 text-sm tabular-nums text-ink/60">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}