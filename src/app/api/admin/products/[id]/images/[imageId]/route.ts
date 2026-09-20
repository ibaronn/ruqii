import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../../../../_guard";
import { deleteImageFiles, thumbUrl } from "@/lib/images";

export async function DELETE(
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

  await prisma.productImage.delete({ where: { id: image.id } });
  await deleteImageFiles([image.url]);

  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId: params.id },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.productImage.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

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