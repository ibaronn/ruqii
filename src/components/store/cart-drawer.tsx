"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "./store-provider";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { QuantityStepper } from "@/components/ui/quantity";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    lines,
    count,
    subtotal,
    isCartOpen,
    closeCart,
    setQty,
    remove,
  } = useStore();

  if (usePathname().startsWith("/admin")) return null;

  return (
    <Drawer open={isCartOpen} onClose={closeCart} side="left" labelledBy="cart-drawer-title">
      <div className="flex items-center justify-between border-b border-white/50 px-5 py-4">
        <h2 id="cart-drawer-title" className="text-lg font-medium">
          سلة التسوق
          {count > 0 && (
            <span className="ms-2 text-sm font-normal text-ink/45">
              ({count} {count === 1 ? "منتج" : "منتجات"})
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={closeCart}
          aria-label="إغلاق السلة"
          className="flex size-9 items-center justify-center rounded-lg text-ink/50 transition hover:bg-white/60 hover:text-ink"
        >
          <X className="size-5" />
        </button>
      </div>

      {count === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-white/50">
            <ShoppingBag className="size-8 text-ink/30" />
          </div>
          <h3 className="text-lg font-medium">السلة فارغة</h3>
          <p className="mt-1.5 text-sm text-ink/55">
            اختر من تشكيلة رُقي لتضيف لمساتك المفضلة.
          </p>
          <Button
            className="mt-6"
            size="lg"
            onClick={() => {
              closeCart();
              window.location.href = "/products";
            }}
          >
            ابدأ التسوق
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 divide-y divide-white/40 overflow-y-auto px-5">
            {lines.map((line) => (
              <div key={line.productId} className="flex gap-4 py-5">
                <Link
                  href={`/products/${line.slug}`}
                  onClick={closeCart}
                  className="relative block size-20 shrink-0 overflow-hidden rounded-xl bg-white/50"
                >
                  {line.image ? (
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-ink/25">
                      رُقي
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${line.slug}`}
                      onClick={closeCart}
                      className="trim-lines line-2 text-[14.5px] font-medium leading-snug text-ink hover:text-ink/70"
                    >
                      {line.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(line.productId)}
                      aria-label="إزالة من السلة"
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink/35 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-sm text-ink/50">
                    {formatPrice(line.priceCents)}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <QuantityStepper
                      size="sm"
                      value={line.quantity}
                      min={1}
                      max={line.stock || 999}
                      onChange={(q) => setQty(line.productId, q)}
                    />
                    <p className="text-[15px] font-semibold tabular-nums">
                      {formatPrice(line.priceCents * line.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/50 px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[15px] text-ink/70">الإجمالي الفرعي</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Button full size="lg" onClick={() => (window.location.href = "/checkout")}>
              إتمام الطلب
            </Button>
            <button
              type="button"
              onClick={closeCart}
              className="mt-3 w-full rounded-lg py-2 text-sm text-ink/55 transition hover:bg-white/50 hover:text-ink"
            >
              متابعة التسوق
            </button>
          </div>
        </>
      )}
    </Drawer>
  );
}