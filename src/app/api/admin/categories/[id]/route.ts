import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../../_guard";
import { categorySchema } from "@/lib/validators";

const partial = categorySchema.partial();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const category = await prisma.category.findUnique({
    where: { id: params.id },
  });
  if (!category) {
    return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const parsed = partial.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (data.slug && data.slug !== category.slug) {
    const clash = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (clash) {
      return NextResponse.json({ error: "المعرّف مستخدم مسبقًا" }, { status: 409 });
    }
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: {
      ...(data.nameAr !== undefined ? { nameAr: data.nameAr } : {}),
      ...(data.nameEn !== undefined ? { nameEn: data.nameEn } : {}),
      ...(data.description !== undefined
        ? { description: data.description ?? null }
        : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.navHidden !== undefined ? { navHidden: data.navHidden } : {}),
      ...(data.slug !== undefined
        ? { slug: data.slug }
        : {}),
    },
  });

  return NextResponse.json({ category: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) {
    return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 404 });
  }
  if (category._count.products > 0) {
    return NextResponse.json(
      { error: "لا يمكن حذف تصنيف يحتوي على منتجات" },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}