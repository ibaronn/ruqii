"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useStore } from "./store-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { orderSchema } from "@/lib/validators";

export function CheckoutForm() {
  const { lines, subtotal, clear } = useStore();
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="shell py-10">
        <div className="skeleton h-12 w-64" />
        <div className="skeleton mt-8 h-72 w-full" />
      </div>
    );
  }

  const empty = lines.length === 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const parsed = orderSchema.safeParse({
      customerName: name,
      customerPhone: phone,
      city,
      items: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "تعذّر إنشاء الطلب");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/success/${data.orderNumber}`);
    } catch {
      setServerError("تعذّر الاتصال، حاول مرة أخرى");
      setSubmitting(false);
    }
  };

  if (empty) {
    return (
      <div className="shell flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-stone-faint">
          <Lock className="size-7 text-ink/35" />
        </div>
        <h1 className="text-2xl font-medium">السلة فارغة</h1>
        <p className="mt-2 text-sm text-ink/55">
          لا يمكن إتمام الطلب دون منتجات في السلة.
        </p>
        <Button className="mt-6" size="lg" onClick={() => router.push("/products")}>
          ابدأ التسوق
        </Button>
      </div>
    );
  }

  return (
    <div className="shell py-10 lg:py-14">
      <header className="mb-8">
        <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-ink/45">
          الخطوة الأخيرة
        </p>
        <h1 className="mt-3 text-4xl font-medium sm:text-5xl">إتمام الطلب</h1>
      </header>

      <form onSubmit={submit} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section aria-labelledby="customer-info-title">
            <h2 id="customer-info-title" className="text-lg font-medium">
              معلومات التوصيل
            </h2>
            <p className="mt-1 text-sm text-ink/50">
              ثلاثة حقول فقط وستكون طلبتك في الطريق.
            </p>

            <div className="mt-6 max-w-lg space-y-5">
              <div>
                <label htmlFor="customer-name" className="mb-1.5 block text-[15px] font-medium">
                  الاسم
                </label>
                <Input
                  id="customer-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.customerName}
                  dir="rtl"
                />
              </div>

              <div>
                <label htmlFor="customer-phone" className="mb-1.5 block text-[15px] font-medium">
                  رقم الهاتف
                </label>
                <Input
                  id="customer-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  className="text-start"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.customerPhone}
                />
              </div>

              <div>
                <label htmlFor="customer-city" className="mb-1.5 block text-[15px] font-medium">
                  المدينة / المنطقة
                </label>
                <Input
                  id="customer-city"
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={errors.city}
                  dir="rtl"
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="order-items-title">
            <h2 id="order-items-title" className="text-lg font-medium">
              المنتجات
            </h2>
            <ul className="mt-4 divide-y divide-white/40 border-y border-white/50">
              {lines.map((line) => (
                <li key={line.productId} className="flex items-center gap-4 py-4">
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-white/40">
                    {line.image ? (
                      <img src={line.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-ink/25">
                        رُقي
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="trim-lines line-1 text-[15px] font-medium">{line.name}</p>
                    <p className="mt-0.5 text-sm text-ink/50">
                      {line.quantity} × {formatPrice(line.priceCents)}
                    </p>
                  </div>
                  <p className="text-[15px] font-semibold tabular-nums">
                    {formatPrice(line.priceCents * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass p-6">
            <h2 className="text-lg font-medium">ملخص</h2>
            <dl className="mt-5 space-y-3 text-[15px]">
              <div className="flex items-center justify-between">
                <dt className="text-ink/60">الإجمالي الفرعي</dt>
                <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink/60">الشحن</dt>
                <dd className="text-ink/40">عند الاستلام</dd>
              </div>
              <div className="flex items-center justify-between border-t border-white/50 pt-4 text-base">
                <dt className="font-medium">الإجمالي</dt>
                <dd className="text-xl font-semibold tabular-nums">
                  {formatPrice(subtotal)}
                </dd>
              </div>
            </dl>

            {serverError && (
              <div
                role="alert"
                className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {serverError}
              </div>
            )}

            <Button full size="lg" className="mt-6" type="submit" loading={submitting}>
              {submitting ? "جارٍ إنشاء الطلب…" : "تأكيد الطلب"}
            </Button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink/45">
              <ShieldCheck className="size-3.5" />
              أسعار دقيقة معتمدة من المتجر، والدفع عند الاستلام.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}