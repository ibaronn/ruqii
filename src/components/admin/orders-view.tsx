"use client";

import * as React from "react";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { StatusBadge } from "./status-badge";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { formatPrice, formatTimeFull } from "@/lib/utils";
import { cn } from "@/lib/utils";

type OrderItem = {
  id: string;
  productId: string;
  productNameAr: string;
  priceCents: number;
  quantity: number;
  imageUrl: string | null;
  lineTotalCents: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  totalCents: number;
  status: string;
  itemCount: number;
  createdAt: string;
  items: OrderItem[];
};

type Page = { orders: Order[]; total: number; page: number; pageSize: number };

const PAGE_SIZE = 12;

export function OrdersView() {
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Page | null>(null);
  const [detail, setDetail] = React.useState<Order | null>(null);
  const [updating, setUpdating] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const load = React.useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (status !== "all") params.set("status", status);
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    fetch(`/api/admin/orders?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData(null));
  }, [page, status, debouncedQ]);

  React.useEffect(() => {
    setPage(1);
  }, [status, debouncedQ]);

  React.useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (orderId: string, next: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        setDetail((d) => (d ? { ...d, status: next } : d));
        load();
      } else {
        const data = await res.json().catch(() => null);
        window.alert(data?.error ?? "تعذّر تحديث الحالة");
      }
    } catch {
      window.alert("تعذّر الاتصال، حاول مرة أخرى");
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/45">
          لوحة التحكم
        </p>
        <h1 className="mt-2 text-3xl font-medium">الطلبات</h1>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="ps-10"
            placeholder="بحث برقم الطلب، العميل، الهاتف…"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-44">
          <option value="all">كل الحالات</option>
          <option value="APPROVED">تمت الموافقة</option>
          <option value="SHIPPING">قيد الشحن</option>
          <option value="DELIVERED">تم التوصيل</option>
        </Select>
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-start text-sm">
            <thead>
              <tr className="border-b border-white/50 bg-white/40 text-[12px] uppercase tracking-wider text-ink/45">
                <th className="px-4 py-3 text-start font-medium">الطلب</th>
                <th className="px-4 py-3 text-start font-medium">العميل</th>
                <th className="px-4 py-3 text-start font-medium">المنتجات</th>
                <th className="px-4 py-3 text-start font-medium">الإجمالي</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-end font-medium">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {!data &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-6">
                      <div className="skeleton h-6 w-full" />
                    </td>
                  </tr>
                ))}
              {data?.orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-ink/45">
                    لا توجد طلبات مطابقة.
                  </td>
                </tr>
              )}
              {data?.orders.map((o) => (
                <tr key={o.id} className="hover:bg-bone-warm/60">
                  <td className="px-4 py-3">
                    <p className="font-medium tabular-nums">{o.orderNumber}</p>
                    <p className="mt-0.5 text-[12px] text-ink/45">
                      {formatTimeFull(o.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{o.customerName}</p>
                    <p className="mt-0.5 text-[12px] text-ink/45" dir="ltr" style={{ textAlign: "start" }}>
                      {o.customerPhone} · {o.city}
                    </p>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink/70">
                    {o.itemCount}
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">
                    {formatPrice(o.totalCents)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetail(o)}
                      className="gap-1.5"
                    >
                      <Eye className="size-3.5" />
                      عرض
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/50 px-4 py-3">
            <p className="text-[13px] text-ink/55 tabular-nums">{data.total} طلبًا</p>
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

      <Modal open={!!detail} onClose={() => setDetail(null)} labelledBy="order-detail-title" className="sm:max-w-2xl">
        {detail && (
          <>
            <ModalHeader
              title={`${detail.orderNumber} — تفاصيل الطلب`}
              onClose={() => setDetail(null)}
            />
            <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
              <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink/40">العميل</p>
                  <p className="mt-1 text-sm font-medium">{detail.customerName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink/40">الهاتف</p>
                  <p className="mt-1 text-sm font-medium" dir="ltr" style={{ textAlign: "right" }}>
                    {detail.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink/40">المدينة</p>
                  <p className="mt-1 text-sm font-medium">{detail.city}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink/40">الوقت</p>
                  <p className="mt-1 text-sm font-medium">{formatTimeFull(detail.createdAt)}</p>
                </div>
              </section>

              <section className="mt-6">
                <h3 className="text-sm font-semibold">تغيير الحالة</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={updating === detail.id}
                      onClick={() => updateStatus(detail.id, s)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13px] font-medium transition active:scale-[0.97] disabled:opacity-50",
                        detail.status === s
                          ? "border-transparent bg-ink text-white"
                          : "glass-soft border-transparent text-ink/70 hover:text-ink"
                      )}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-ink/45">
                  الحالة الحالية: <StatusBadge status={detail.status} />
                </p>
              </section>

              <section className="mt-6">
                <h3 className="text-sm font-semibold">المنتجات</h3>
                <ul className="mt-3 divide-y divide-white/40">
                  {detail.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-white/40">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="trim-lines line-1 text-sm font-medium">{item.productNameAr}</p>
                        <p className="text-[12px] text-ink/45">
                          {item.quantity} × {formatPrice(item.priceCents)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {formatPrice(item.lineTotalCents)}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-white/50 pt-4">
                  <span className="text-sm text-ink/60">الإجمالي</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {formatPrice(detail.totalCents)}
                  </span>
                </div>
              </section>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}