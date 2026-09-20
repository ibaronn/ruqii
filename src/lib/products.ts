import { Prisma } from "@prisma/client";
import type { ProductSummary } from "./types";
import { thumbUrl } from "./images";

export const productInclude = Prisma.validator<Prisma.ProductInclude>()({
  category: { select: { nameAr: true, slug: true } },
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    select: { id: true, url: true, altAr: true, isPrimary: true },
  },
});

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export function serializeProduct(p: ProductWithRelations): ProductSummary {
  const image = p.images.find((i) => i.isPrimary) ?? p.images[0];
  return {
    id: p.id,
    slug: p.slug,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    stock: p.stock,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    categoryNameAr: p.category.nameAr,
    categorySlug: p.category.slug,
    image: image ? thumbUrl(image.url) ?? image.url : null,
    images: p.images.map((i) => ({
      id: i.id,
      url: i.url,
      thumb: thumbUrl(i.url),
      altAr: i.altAr,
      isPrimary: i.isPrimary,
    })),
    description: p.description,
  };
}