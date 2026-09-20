import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../../../../../_guard";
import { thumbUrl } from "@/lib/images";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const image = await prisma.productImage.findUnique({
    where: { id: params.imageId },
  });
  if (!image || image.productId !== params.id) {
    return NextResponse.json({ error: "الصورة غير موجودة" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId: params.id },
      data: { isPrimary: false },
    }),
    prisma.productImage.update({
      where: { id: params.imageId },
      data: { isPrimary: true },
    }),
  ]);

  const images = await prisma.productImage.findMany({
    where: { productId: params.id },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json({
    images: images.map((i) => ({
      id: i.id,
      url: i.url,
      thumb: thumbUrl(i.url),
      altAr: i.altAr,
      isPrimary: i.isPrimary,
    })),
  });
}