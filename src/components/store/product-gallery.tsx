"use client";

import * as React from "react";
import { ZoomIn } from "lucide-react";
import type { ProductSummary } from "@/lib/types";
import { ProductPlaceholder } from "./product-placeholder";

export function ProductGallery({ product }: { product: ProductSummary }) {
  const imgs = (product.images ?? []).filter((i) => i.url);
  const [active, setActive] = React.useState(0);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const [zooming, setZooming] = React.useState(false);

  React.useEffect(() => setActive(0), [product.id]);

  if (imgs.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-white/40">
        <ProductPlaceholder name={product.nameAr} />
      </div>
    );
  }

  const activeImg = imgs[Math.min(active, imgs.length - 1)];

  const handleMove = (e: React.MouseEvent) => {
    const frame = frameRef.current;
    if (!frame || !zooming) return;
    const rect = frame.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    frame.style.setProperty("--mx", `${x}%`);
    frame.style.setProperty("--my", `${y}%`);
  };

  return (
    <div>
      {/* Desktop */}
      <div
        ref={frameRef}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMove}
        className="relative hidden aspect-square overflow-hidden rounded-2xl bg-white/40 md:block"
      >
        <img
          key={activeImg.url}
          src={activeImg.url}
          alt={activeImg.altAr ?? product.nameAr}
          className={`h-full w-full object-contain transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            zooming ? "scale-[1.9]" : "scale-100"
          }`}
          style={{
            transformOrigin: zooming ? "var(--mx,50%) var(--my,50%)" : "50% 50%",
          }}
        />
        {zooming && (
          <ZoomIn className="pointer-events-none absolute bottom-3 start-3 size-5 text-ink/45" />
        )}
      </div>

      {/* Mobile swipe carousel */}
      <div
        className="no-scrollbar relative flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-white/40 md:hidden"
        aria-label="صور المنتج"
      >
        {imgs.map((img, i) => (
          <img
            key={img.url}
            src={img.url}
            alt={img.altAr ?? product.nameAr}
            className="aspect-square w-full shrink-0 snap-center object-contain"
          />
        ))}
      </div>

      {imgs.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
            {imgs.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`عرض الصورة ${i + 1}`}
                aria-current={i === active}
                className={
                  i === active
                    ? "size-16 shrink-0 overflow-hidden rounded-xl ring-2 ring-ink ring-offset-2 transition-all duration-300"
                    : "size-16 shrink-0 overflow-hidden rounded-xl opacity-70 transition-all duration-300 hover:scale-[1.04] hover:opacity-100"
                }
              >
                <img src={img.thumb ?? img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <span className="shrink-0 text-xs tabular-nums text-ink/45">
            {active + 1} / {imgs.length}
          </span>
        </div>
      )}
    </div>
  );
}