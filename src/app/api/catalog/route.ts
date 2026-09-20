import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productInclude, serializeProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const category = sp.get("category")?.trim();
  const limitRaw = Number(sp.get("limit") ?? "12");
  const limit = Math.min(50, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 12));
  const sortRaw = sp.get("sort");
  const inStock = sp.get("inStock") === "true";

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ isFeatured: "desc" }];
  if (sortRaw === "price-asc") orderBy = [{ priceCents: "asc" }];
  else if (sortRaw === "price-desc") orderBy = [{ priceCents: "desc" }];
  else if (sortRaw === "newest") orderBy = [{ createdAt: "desc" }];

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category
        ? { category: { slug: category } }
        : {}),
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
    },
    include: productInclude,
    orderBy,
    take: limit,
  });

  return NextResponse.json({
    products: products.map(serializeProduct),
    count: products.length,
  });
}