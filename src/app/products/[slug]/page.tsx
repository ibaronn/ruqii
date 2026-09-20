import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productInclude, serializeProduct } from "@/lib/products";
import { ProductGallery } from "@/components/store/product-gallery";
import { BuyPanel } from "@/components/store/buy-panel";
import { ProductGrid } from "@/components/store/product-grid";
import { Reveal } from "@/components/ui/reveal";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { nameAr: true, description: true, category: { select: { nameAr: true } } },
  });
  if (!product) return { title: "منتج غير موجود" };
  return {
    title: product.nameAr,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: productInclude,
  });
  if (!product || !product.isActive) notFound();

  const serialized = serializeProduct(product);

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="shell pb-24 pt-6 md:pb-16 lg:pt-10">
      <nav aria-label="مسار التنقل" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink/50">
          <li>
            <Link href="/" className="transition hover:text-ink">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronLeft className="size-4 text-ink/30" />
          </li>
          <li>
            <Link href="/products" className="transition hover:text-ink">
              التشكيلة
            </Link>
          </li>
          {product.category.slug && (
            <>
              <li aria-hidden="true">
                <ChevronLeft className="size-4 text-ink/30" />
              </li>
              <li>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="transition hover:text-ink"
                >
                  {product.category.nameAr}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">
            <ChevronLeft className="size-4 text-ink/30" />
          </li>
          <li aria-current="page" className="trim-lines line-1 max-w-44 text-ink">
            {product.nameAr}
          </li>
        </ol>
      </nav>

      <div
        className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16"
      >
        <div>
          <ProductGallery product={serialized} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BuyPanel product={serialized} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-ink/45">
                  قد يعجبك
                </p>
                <h2 className="mt-3 text-2xl font-medium sm:text-3xl">
                  قطع مشابهة
                </h2>
              </div>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-ink transition hover:text-ink/60"
              >
                المزيد
                <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
          <Reveal className="mt-8" delay={60}>
            <ProductGrid products={related.map(serializeProduct)} />
          </Reveal>
        </section>
      )}
    </div>
  );
}