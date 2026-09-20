import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../_guard";
import { productSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { productInclude, serializeProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const category = sp.get("category")?.trim();
  const status = sp.get("status")?.trim();
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(5, Number(sp.get("pageSize") ?? "10")));

  const where: Prisma.ProductWhereInput = {
    ...(category && category !== "all" ? { categoryId: category } : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(q
      ? {
          OR: [
            { nameAr: { contains: q } },
            { nameEn: { contains: q } },
            { slug: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    products: products.map(serializeProduct),
    total,
    page,
    pageSize,
  });
}

export async function POST(req: NextRequest) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 400 });
  }

  const baseSlug =
    data.slug?.trim() || slugify(data.nameEn || "") || `p-${Date.now()}`;
  let slug = baseSlug;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++i}`;
  }

  const product = await prisma.product.create({
    data: {
      nameAr: data.nameAr,
      nameEn: data.nameEn ?? null,
      slug,
      description: data.description,
      priceCents: data.priceCents,
      compareAtCents: data.compareAtCents ?? null,
      stock: data.stock,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      categoryId: data.categoryId,
    },
    include: productInclude,
  });

  return NextResponse.json(
    { product: serializeProduct(product) },
    { status: 201 }
  );
}