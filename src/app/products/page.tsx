import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productInclude, serializeProduct } from "@/lib/products";
import { ProductGrid } from "@/components/store/product-grid";
import { ProductsToolbar } from "@/components/store/products-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "المنتجات",
  description: "تصفح تشكيلة رُقي الكاملة من الأزياء والجلديات والعطور والإكسسوارات.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const read = (k: string) => {
    const v = searchParams[k];
    return typeof v === "string" ? v : undefined;
  };

  const q = read("q")?.trim();
  const category = read("category")?.trim();
  const sort = read("sort")?.trim() ?? "featured";
  const inStock = read("inStock") === "true";
  const minSar = Number(read("min"));
  const maxSar = Number(read("max"));

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { nameAr: { contains: q } },
            { nameEn: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
    ...(inStock ? { stock: { gt: 0 } } : {}),
    ...(Number.isFinite(minSar) || Number.isFinite(maxSar)
      ? {
          priceCents: {
            ...(Number.isFinite(minSar) ? { gte: minSar * 100 } : {}),
            ...(Number.isFinite(maxSar) ? { lte: maxSar * 100 } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "price-asc"
      ? [{ priceCents: "asc" }]
      : sort === "price-desc"
        ? [{ priceCents: "desc" }]
        : sort === "newest"
          ? [{ createdAt: "desc" }]
          : [{ isFeatured: "desc" }, { createdAt: "desc" }];

  const [products, total, categoriesRaw] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true, navHidden: false },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
  ]);

  const categories = categoriesRaw.map((c) => ({
    slug: c.slug,
    nameAr: c.nameAr,
    count: c._count.products,
  }));

  return (
    <div className="shell py-10 lg:py-14">
      <header className="mb-8">
        <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-ink/45">
          رُقي
        </p>
        <h1 className="mt-3 text-4xl font-medium sm:text-5xl">التشكيلة</h1>
        {q && (
          <p className="mt-3 text-[15px] text-ink/55">
            نتائج البحث عن{" "}
            <span className="font-medium text-ink">"{q}"</span>
          </p>
        )}
      </header>

      <ProductsToolbar categories={categories} total={total} />

      <div className="mt-8">
        {products.length > 0 ? (
          <ProductGrid products={products.map(serializeProduct)} />
        ) : (
          <EmptyState
            icon={<PackageOpen className="size-7" />}
            title={q ? "لم نجد منتجات مطابقة" : "لا توجد منتجات هنا"}
            subtitle={
              q
                ? "جرّب كلمات أخرى أو تصفح جميع التصنيفات"
                : "جرّب تغيير الفلاتر أو تصفح تصنيفًا آخر"
            }
            className="border border-dashed border-white/60"
          />
        )}
      </div>
    </div>
  );
}