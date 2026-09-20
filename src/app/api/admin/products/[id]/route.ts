import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../../_guard";
import { productSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { productInclude, serializeProduct } from "@/lib/products";
import { deleteImageFiles } from "@/lib/images";

const partialSchema = productSchema.partial();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { ...productInclude, category: { select: { id: true, nameAr: true, nameEn: true, slug: true } } },
  });
  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ product: serializeProduct(product) });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const parsed = partialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const existing = await prisma.product.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  const data = parsed.data;
  let slug = existing.slug;
  if (data.slug?.trim()) {
    slug = data.slug.trim();
    const clash = await prisma.product.findFirst({
      where: { slug, id: { not: params.id } },
    });
    if (clash) {
      return NextResponse.json({ error: "المعرّف مستخدم مسبقًا" }, { status: 409 });
    }
  } else if (data.nameEn && !data.slug) {
    slug = slugify(data.nameEn) || existing.slug;
    const clash = await prisma.product.findFirst({
      where: { slug, id: { not: params.id } },
    });
    if (clash) {
      return NextResponse.json({ error: "المعرّف مستخدم مسبقًا" }, { status: 409 });
    }
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(data.nameAr !== undefined ? { nameAr: data.nameAr } : {}),
      ...(data.nameEn !== undefined ? { nameEn: data.nameEn ?? null } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.priceCents !== undefined ? { priceCents: data.priceCents } : {}),
      ...(data.compareAtCents !== undefined
        ? { compareAtCents: data.compareAtCents ?? null }
        : {}),
      ...(data.stock !== undefined ? { stock: data.stock } : {}),
      slug,
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
    },
    include: productInclude,
  });

  return NextResponse.json({ product: serializeProduct(product) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { select: { url: true } } },
  });
  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  try {
    await prisma.product.delete({ where: { id: params.id } });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2003") {
      return NextResponse.json(
        { error: "لا يمكن حذف منتج مرتبط بطلبات سابقة، يمكنك تعطيله بدلًا من ذلك" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "تعذّر حذف المنتج" }, { status: 500 });
  }

  await deleteImageFiles(product.images.map((i) => i.url));
  return NextResponse.json({ ok: true });
}