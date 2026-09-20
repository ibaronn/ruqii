import { ProductCard } from "./product-card";
import type { ProductSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
}: {
  products: ProductSummary[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {products.map((p, i) => (
        <li key={p.id} className="min-w-0">
          <ProductCard product={p} priority={i < 2} />
        </li>
      ))}
    </ul>
  );
}