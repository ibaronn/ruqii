"use client";

import { useState } from "react";
import { Check, PackageCheck, Ruler, ShieldCheck, Truck } from "lucide-react";
import type { ProductSummary } from "@/lib/types";
import { PriceTag } from "./price-tag";
import { QuantityStepper } from "@/components/ui/quantity";
import { useStore } from "./store-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BuyPanel({ product }: { product: ProductSummary }) {
  const { add } = useStore();
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  const addToCart = () => {
    if (outOfStock) return;
    setPending(true);
    window.setTimeout(() => {
      add({
        productId: product.id,
        slug: product.slug,
        name: product.nameAr,
        priceCents: product.priceCents,
        compareAtCents: product.compareAtCents,
        image: product.image,
        stock: product.stock,
        quantity: qty,
      });
      setPending(false);
    }, 90);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-4">
          {product.categoryNameAr && (
            <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-ink/45">
              {product.categoryNameAr}
            </p>
          )}
          <h1 className="text-3xl font-medium leading-tight sm:text-4xl">
            {product.nameAr}
          </h1>
          <PriceTag
            size="lg"
            priceCents={product.priceCents}
            compareAtCents={product.compareAtCents}
          />

          <div className="flex items-center gap-2">
            {outOfStock ? (
              <Badge tone="red">غير متوفر حاليًا</Badge>
            ) : lowStock ? (
              <Badge tone="yellow">
                <span className="animate-pulse-soft">●</span>
                متبقي {product.stock} فقط
              </Badge>
            ) : (
              <Badge tone="green">
                <Check className="size-3" />
                متوفر
              </Badge>
            )}
          </div>
        </div>

        <div className="border-t border-white/50 pt-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink/55">الكمية</span>
              <QuantityStepper
                value={qty}
                onChange={setQty}
                max={outOfStock ? 1 : product.stock}
              />
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={outOfStock || pending}
              className={cn(
                "inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-xl text-base font-medium transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45",
                outOfStock
                  ? "bg-stone-faint text-ink/45"
                  : "bg-ink text-white shadow-[0_14px_30px_-14px_rgba(0,0,0,0.6)] hover:bg-[#1f1f1f]"
              )}
            >
              {outOfStock ? (
                "غير متوفر حاليًا"
              ) : pending ? (
                "جارٍ الإضافة…"
              ) : (
                <>أضف إلى السلة — {formatInlinePrice(product.priceCents * qty)}</>
              )}
            </button>
          </div>

          <ul className="mt-6 space-y-2.5 text-sm text-ink/60">
            <li className="flex items-center gap-2.5">
              <Truck className="size-4 text-ink/40" />
              توصيل سريع وموثوق لجميع المدن
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-ink/40" />
              جودة مضمونة من الخامة إلى التسليم
            </li>
            <li className="flex items-center gap-2.5">
              <PackageCheck className="size-4 text-ink/40" />
              الدفع عند الاستلام متاح
            </li>
          </ul>
        </div>

        <div className="border-t border-white/50 pt-8">
          <h2 className="text-[15px] font-semibold">الوصف</h2>
          <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.9] text-ink/70">
            {product.description}
          </p>
        </div>

        <div className="border-t border-white/50 pt-6 text-sm text-ink/55">
          <dl className="grid grid-cols-2 gap-y-3">
            <div>
              <dt className="text-ink/40">التصنيف</dt>
              <dd className="mt-0.5 font-medium text-ink">
                <a href={`/products?category=${product.categorySlug}`} className="hover:underline">
                  {product.categoryNameAr}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-ink/40">الحالة</dt>
              <dd className="mt-0.5 font-medium text-ink">
                {outOfStock ? "نفد المخزون" : "متوفر"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-ink/40">
                <Ruler className="size-3.5" />
                القياسات
              </dt>
              <dd className="mt-0.5 font-medium text-ink">
                موضّحة عند التسليم
              </dd>
            </div>
            <div>
              <dt className="text-ink/40">المرجع</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-ink">
                {product.slug}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="glass-bar fixed inset-x-3 bottom-3 z-40 rounded-2xl px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <PriceTag
            size="sm"
            priceCents={product.priceCents}
            compareAtCents={product.compareAtCents}
          />
          <button
            type="button"
            onClick={() =>
              add({
                productId: product.id,
                slug: product.slug,
                name: product.nameAr,
                priceCents: product.priceCents,
                compareAtCents: product.compareAtCents,
                image: product.image,
                stock: product.stock,
                quantity: qty,
              })
            }
            disabled={outOfStock}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-7 text-[15px] font-medium text-white shadow-[0_12px_26px_-14px_rgba(0,0,0,0.6)] transition hover:-translate-y-px active:translate-y-0 active:scale-[0.97] disabled:opacity-45"
          >
            {outOfStock ? "غير متوفر" : "أضف إلى السلة"}
          </button>
        </div>
      </div>
    </>
  );
}

function formatInlinePrice(cents: number) {
  const value = cents / 100;
  const digits = Number.isInteger(value)
    ? new Intl.NumberFormat("en-US").format(value)
    : value.toFixed(2);
  return `${digits} د.ل`;
}