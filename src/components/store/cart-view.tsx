"use client";

import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useStore } from "@/components/store/store-provider";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const { lines, subtotal, setQty, remove, clear } = useStore();

  return (
    <div className="shell py-10 lg:py-14">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-ink/45">
            رُقي
          </p>
          <h1 className="mt-3 text-4xl font-medium sm:text-5xl">سلة التسوق</h1>
        </div>
        {lines.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 text-sm text-ink/50 transition hover:text-red-600"
          >
            <Trash2 className="size-4" />
            إفراغ السلة
          </button>
        )}
      </header>

      {lines.length === 0 ? (
        <EmptyState
          title="السلة فارغة"
          subtitle="استكشف تشكيلة رُقي وأضف ما يعكس ذوقك."
          action={
            <Link href="/products">
              <Button size="lg">
                ابدأ التسوق
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
          }
          className="border border-dashed border-white/60"
        />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-white/40 border-y border-white/50">
            {lines.map((line) => (
              <li key={line.productId} className="flex gap-4 py-6 sm:gap-6">
                <Link
                  href={`/products/${line.slug}`}
                  className="block size-24 shrink-0 overflow-hidden rounded-xl bg-white/40 sm:size-28"
                >
                  {line.image ? (
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-ink/25">
                      رُقي
                    </div>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/products/${line.slug}`}
                      className="trim-lines line-2 text-[16px] font-medium leading-snug hover:text-ink/70"
                    >
                      {line.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(line.productId)}
                      aria-label="إزالة من السلة"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/35 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-ink/50">
                    {formatPrice(line.priceCents)}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <QuantityStepper
                      value={line.quantity}
                      max={line.stock || 999}
                      onChange={(q) => setQty(line.productId, q)}
                    />
                    <p className="text-[17px] font-semibold tabular-nums">
                      {formatPrice(line.priceCents * line.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass p-6">
              <h2 className="text-lg font-medium">ملخص الطلب</h2>
              <dl className="mt-5 space-y-3 text-[15px]">
                <div className="flex items-center justify-between">
                  <dt className="text-ink/60">الإجمالي الفرعي</dt>
                  <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink/60">الشحن</dt>
                  <dd className="text-ink/40">يُحدد عند التأكيد</dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/50 pt-4 text-base">
                  <dt className="font-medium">الإجمالي</dt>
                  <dd className="text-xl font-semibold tabular-nums">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
              </dl>
              <Button
                full
                size="lg"
                className="mt-6"
                onClick={() => (window.location.href = "/checkout")}
              >
                إتمام الطلب
              </Button>
              <Link
                href="/products"
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-none py-2 text-sm text-ink/55 transition hover:text-ink"
              >
                متابعة التسوق
                <ArrowLeft className="size-3.5" />
              </Link>
              <p className="mt-4 text-center text-xs text-ink/40">
                تتم الموافقة على الطلب بعد التأكيد، ويُدفع عند الاستلام.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}