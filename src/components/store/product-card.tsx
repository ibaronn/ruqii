import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { PriceTag } from "./price-tag";
import { ProductPlaceholder } from "./product-placeholder";
import { Badge } from "@/components/ui/badge";
import { percentOff } from "@/lib/utils";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductSummary;
  priority?: boolean;
}) {
  const image = product.image;
  const outOfStock = product.stock <= 0;
  const off =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? percentOff(product.priceCents, product.compareAtCents)
      : null;

  return (
    <article className="group flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-1.5">
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.nameAr}
        className="card-glow relative block overflow-hidden rounded-2xl bg-white/45 shadow-[0_0_0_rgba(0,0,0,0)] ring-1 ring-white/50 transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-[0_30px_60px_-24px_rgba(30,24,16,0.42)] focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className="aspect-[3/4] w-full overflow-hidden">
          <div className="relative h-full w-full">
            {image ? (
              <img
                src={image}
                alt={product.nameAr}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.07]"
              />
            ) : (
              <ProductPlaceholder name={product.nameAr} />
            )}
            <div className="pointer-events-none absolute inset-0 -translate-x-1/2 bg-gradient-to-l from-transparent via-white/35 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-1/2 group-hover:opacity-100" aria-hidden="true" />
          </div>
        </div>

        {off && !outOfStock && (
          <Badge
            tone="dark"
            className="absolute top-3 start-3 px-2 py-0.5 text-[11px]"
          >
            خصم {off}%-
          </Badge>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-sm bg-white px-3 py-1.5 text-[12px] font-medium text-ink/70 ring-1 ring-ink/10">
              غير متوفر حاليًا
            </span>
          </div>
        )}

        {!outOfStock && (
          <>
            <div className="absolute inset-x-0 bottom-0 hidden translate-y-3 p-3 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 md:block">
              <AddToCartButton
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.nameAr,
                  priceCents: product.priceCents,
                  compareAtCents: product.compareAtCents,
                  image: image,
                  stock: product.stock,
                }}
                variant="overlay"
              />
            </div>
            <AddToCartButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.nameAr,
                priceCents: product.priceCents,
                compareAtCents: product.compareAtCents,
                image: image,
                stock: product.stock,
              }}
              variant="icon"
              className="absolute bottom-3 end-3 md:hidden"
            />
          </>
        )}
      </Link>

      <div className="mt-3.5 flex flex-col gap-1.5 px-0.5">
        <Link
          href={`/products/${product.slug}`}
          className="trim-lines line-1 text-[15px] font-medium leading-snug text-ink transition-colors hover:text-ink/60"
        >
          {product.nameAr}
        </Link>
        <PriceTag
          size="sm"
          priceCents={product.priceCents}
          compareAtCents={product.compareAtCents}
        />
      </div>
    </article>
  );
}