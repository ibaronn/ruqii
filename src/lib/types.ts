export type ProductImageData = {
  id: string;
  url: string;
  thumb?: string | null;
  altAr: string | null;
  isPrimary: boolean;
};

export type ProductSummary = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn?: string | null;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryNameAr?: string;
  categorySlug?: string;
  image?: string | null;
  images?: ProductImageData[];
  description?: string;
};

export type CartItemPayload = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtCents?: number | null;
  image?: string | null;
  stock: number;
};

export function toCartPayload(p: ProductSummary): CartItemPayload {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.nameAr,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    image: p.images?.[0]?.url ?? p.image ?? null,
    stock: p.stock,
  };
}