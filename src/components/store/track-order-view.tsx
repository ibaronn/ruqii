"use client";

import { useState } from "react";
import { PackageSearch, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice, formatTimeFull } from "@/lib/utils";
import { OrderTimeline } from "@/components/store/order-timeline";
import { STATUS_STEPS } from "@/lib/orders";

type TrackedOrder = {
  orderNumber: string;
  customerName: string;
  city: string;
  totalCents: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: {
    productId: string;
    productNameAr: string;
    priceCents: number;
    quantity: number;
    imageUrl: string | null;
    lineTotalCents: number;
  }[];
};

export function TrackOrderView() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ order?: TrackedOrder; error?: string } | null>(
    null
  );

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setResult(null);
    if (!/^RQI-\d{8}-\d{3,}$/i.test(orderNumber.trim())) {
      setErrors({ orderNumber: "رقم الطلب غير صحيح" });
      return;
    }
    if (phone.trim().length < 7) {
      setErrors({ phone: "أدخل رقم الهاتف" });
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim().toUpperCase(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/track?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error ?? "تعذّر التتبع" });
      } else {
        setResult({ order: data.order });
      }
    } catch {
      setResult({ error: "تعذّر الاتصال، حاول مرة أخرى" });
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = result?.order
    ? Math.max(0, STATUS_STEPS.indexOf(result.order.status as (typeof STATUS_STEPS)[number]))
    : -1;

  return (
    <div className="shell py-10 lg:py-14">
      <header className="mb-8">
        <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-ink/45">
          رُقي
        </p>
        <h1 className="mt-3 text-4xl font-medium sm:text-5xl">تتبع طلبك</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/60">
          أدخل رقم الطلب ورقم الهاتف المسجلين عند تأكيد الطلب لعرض حالته لحظة بلحظة.
        </p>
      </header>

      <form
        onSubmit={search}
        className="glass max-w-xl p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="track-order-number" className="mb-1.5 block text-sm font-medium">
              رقم الطلب
            </label>
            <Input
              id="track-order-number"
              dir="ltr"
              className="text-start tabular-nums"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              error={errors.orderNumber}
              hint="مثال: RQI-20260101-001"
            />
          </div>
          <div>
            <label htmlFor="track-phone" className="mb-1.5 block text-sm font-medium">
              رقم الهاتف
            </label>
            <Input
              id="track-phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              className="text-start tabular-nums"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full sm:w-auto" type="submit" loading={loading}>
              <PackageSearch className="size-4" />
              تتبع
            </Button>
          </div>
        </div>
      </form>

      {result?.error && (
        <div
          role="alert"
          className="mt-6 max-w-xl rounded-sm border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {result.error}
        </div>
      )}

      {result?.order && (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <div className="glass p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium">حالة الطلب</h2>
                  <p className="mt-1 text-sm text-ink/55">
                    الرقم:{" "}
                    <span className="font-medium tabular-nums text-ink">
                      {result.order.orderNumber}
                    </span>
                  </p>
                </div>
                <span className="text-[12px] text-ink/40">
                  آخر تحديث: {formatTimeFull(result.order.updatedAt)}
                </span>
              </div>
              {result.order.status === "CANCELLED" ? (
                <div className="rounded-2xl border border-red-100/70 bg-red-50/70 px-5 py-4 text-[15px] text-red-700">
                تم إلغاء هذا الطلب. إن كان لديك استفسار فتواصل معنا.
              </div>
              ) : (
                <OrderTimeline stepIndex={stepIndex} />
              )}
            </div>

            <div className="glass p-6">
              <h3 className="text-[15px] font-semibold">المنتجات</h3>
              <ul className="mt-4 divide-y divide-white/40">
                {result.order.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-4 py-3.5">
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-white/40">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="trim-lines line-1 text-[15px] font-medium">
                        {item.productNameAr}
                      </p>
                      <p className="mt-0.5 text-sm text-ink/50">
                        {item.quantity} × {formatPrice(item.priceCents)}
                      </p>
                    </div>
                    <p className="text-[15px] font-semibold tabular-nums">
                      {formatPrice(item.lineTotalCents)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <aside>
            <div className="glass p-5">
              <h3 className="text-[15px] font-semibold">ملخص</h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink/55">الاسم</dt>
                  <dd className="font-medium">{result.order.customerName}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink/55">المدينة / المنطقة</dt>
                  <dd className="font-medium">{result.order.city}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/50 pt-3">
                  <dt className="text-ink/55">الإجمالي</dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {formatPrice(result.order.totalCents)}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={search}
                className="glass-soft mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-transparent py-2.5 text-sm text-ink/60 transition hover:text-ink"
              >
                <RefreshCw className="size-3.5" />
                تحديث التتبع
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}