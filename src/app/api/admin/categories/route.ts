import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../_guard";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      navHidden: c.navHidden,
      productCount: c._count.products,
    })),
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

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const existing = await prisma.category.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    return NextResponse.json({ error: "المعرّف مستخدم مسبقًا" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: {
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      slug: data.slug,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      navHidden: data.navHidden ?? false,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}