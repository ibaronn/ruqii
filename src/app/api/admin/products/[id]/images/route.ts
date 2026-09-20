import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../../../_guard";
import {
  saveImageFromBuffer,
  saveImageFromUrl,
  thumbUrl,
} from "@/lib/images";
import { MAX_IMAGE_BYTES } from "@/lib/images";
import { imageUrlSchema } from "@/lib/validators";

export const runtime = "nodejs";
const MAX_FILES = 6;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    const results: { url: string }[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const files = form
        .getAll("files")
        .filter((f): f is File => f instanceof File);
      if (files.length === 0) {
        return NextResponse.json(
          { error: "اختر صورًا على الأقل" },
          { status: 400 }
        );
      }
      if (files.length > MAX_FILES) {
        return NextResponse.json(
          { error: `الحد الأقصى ${MAX_FILES} صور في المرة الواحدة` },
          { status: 400 }
        );
      }
      for (const file of files) {
        if (file.size > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { error: `حجم الصورة ${file.name} يتجاوز 10MB` },
            { status: 400 }
          );
        }
        const buf = Buffer.from(await file.arrayBuffer());
        const saved = await saveImageFromBuffer(buf, file.type, params.id);
        results.push({ url: saved.mainUrl });
      }
    } else {
      const body = await req.json();
      const parsed = imageUrlSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
          { status: 400 }
        );
      }
      const saved = await saveImageFromUrl(parsed.data.url, params.id);
      results.push({ url: saved.mainUrl, ...(parsed.data.altAr ? { altAr: parsed.data.altAr } : {}) });
    }

    const existingCount = await prisma.productImage.count({
      where: { productId: params.id },
    });
    const first = existingCount === 0;

    const created = await Promise.all(
      results.map((r, idx) =>
        prisma.productImage.create({
          data: {
            productId: params.id,
            url: r.url,
            isPrimary: first && idx === 0,
            sortOrder: existingCount + idx,
          },
        })
      )
    );

    return NextResponse.json(
      {
        images: created.map((i) => ({
          id: i.id,
          url: i.url,
          thumb: thumbUrl(i.url),
          altAr: i.altAr,
          isPrimary: i.isPrimary,
        })),
      },
      { status: 201 }
    );
  } catch (e) {
    const code = (e as { code?: string })?.code;
    return NextResponse.json(
      { error: (e as Error)?.message ?? "تعذّر رفع الصورة" },
      { status: code === "type" || code === "url" || code === "process" || code === "too-large" || code === "empty" ? 400 : 500 }
    );
  }
}