"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Package,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { formatPrice, formatTimeFull } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

type Stats = {
  products: number;
  activeProducts: number;
  orders: number;
  revenueCents: number;
  lowStock: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalCents: number;
    status: string;
    createdAt: string;
  }[];
  byStatus: Record<string, number>;
  salesByDay: { label: string; value: number; count: number }[];
};

function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "dark" | "green" | "red";
}) {
  return (
    <div className="glass p-5">
      <div className="flex items-center gap-2 text-ink/45">
        {icon}
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      <p
        className={cn(
          "mt-3 text-3xl font-semibold tabular-nums",
          tone === "green" && "text-emerald-600",
          tone === "red" && "text-red-600",
          tone === "dark" && "text-ink"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[12px] text-ink/45">{hint}</p>}
    </div>
  );
}

export function DashboardView() {
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const maxDay = Math.max(
    1,
    ...(stats?.salesByDay.map((d) => d.value) ?? [1])
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/45">
            لوحة التحكم
          </p>
          <h1 className="mt-2 text-3xl font-medium">نظرة عامة</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-[15px] font-medium text-white shadow-[0_14px_30px_-14px_rgba(0,0,0,0.6)] transition hover:-translate-y-px hover:bg-[#1f1f1f] active:translate-y-0 active:scale-[0.985]"
        >
          <Plus className="size-4" />
          إضافة منتج
        </Link>
      </header>

      {!stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-md" />
          ))}
        </div>
      )}

      {stats && (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Banknote className="size-4" />}
            label="إجمالي الإيرادات"
            value={formatPrice(stats.revenueCents)}
            hint={`${stats.orders} طلبًا`}
          />
          <StatCard
            icon={<ShoppingCart className="size-4" />}
            label="الطلبات"
            value={String(stats.orders)}
            hint="جميع الطلبات المسجلة"
          />
          <StatCard
            icon={<Package className="size-4" />}
            label="المنتجات"
            value={String(stats.products)}
            hint={`${stats.activeProducts} منتجًا نشطًا`}
          />
          <StatCard
            icon={<AlertTriangle className="size-4" />}
            label="مخزون منخفض"
            value={String(stats.lowStock)}
            hint="منتجات بـ 5 قطع أو أقل"
            tone={stats.lowStock > 0 ? "red" : "green"}
          />
        </section>
      )}

      {stats && (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_1fr]">
          <section className="glass p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-medium">المبيعات — آخر 7 أيام</h2>
              <div className="flex items-center gap-3">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <span key={status} className="flex items-center gap-1.5 text-[12px] text-ink/55">
                    <StatusBadge status={status} />
                    {count}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex h-48 items-end gap-3">
              {stats.salesByDay.map((day, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] tabular-nums text-ink/55">
                    {day.value > 0 ? (day.value / 100).toLocaleString("en-US") : ""}
                  </span>
                  <div className="flex h-36 w-full items-end rounded-lg bg-white/40">
                    <div
                      className="w-full rounded-sm bg-ink transition-all duration-700 ease-out"
                      style={{ height: `${Math.max(3, (day.value / maxDay) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink/45">{day.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">أحدث الطلبات</h2>
              <Link
                href="/admin/orders"
                className="flex items-center gap-1 text-[13px] font-medium text-ink/55 transition hover:text-ink"
              >
                عرض الكل
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/45">
                لا توجد طلبات بعد.
              </p>
            ) : (
              <ul className="divide-y divide-white/40">
                {stats.recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="trim-lines line-1 text-sm font-medium tabular-nums">
                        {o.orderNumber}
                      </p>
                      <p className="trim-lines line-1 text-[12px] text-ink/50">
                        {o.customerName} · {formatTimeFull(o.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatPrice(o.totalCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {stats && stats.lowStock > 0 && (
        <section className="flex items-center gap-4 rounded-md border border-amber-200 bg-amber-50 px-5 py-4">
          <BadgeCheck className="size-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            يوجد <span className="font-semibold">{stats.lowStock}</span> منتجًا
            بمخزون منخفض. جرّد المخزون أو أضف كميات جديدة من صفحة المنتجات.
          </p>
          <Link
            href="/admin/products"
            className="ms-auto shrink-0 text-sm font-medium text-amber-800 underline-offset-2 hover:underline"
          >
            معالجة
          </Link>
        </section>
      )}
    </div>
  );
}