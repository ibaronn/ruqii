import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackingSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`track:${ip}`, 30, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "طلبات كثيرة" }, { status: 429 });
  }

  const parsed = trackingSchema.safeParse({
    orderNumber: req.nextUrl.searchParams.get("orderNumber") ?? "",
    phone: req.nextUrl.searchParams.get("phone") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: parsed.data.orderNumber.toUpperCase(),
      customerPhone: parsed.data.phone,
    },
    include: { items: { orderBy: { id: "asc" } } },
  });

  if (!order) {
    return NextResponse.json(
      { error: "لم نعثر على طلب مطابق، تحقق من رقم الطلب ورقم الهاتف" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      city: order.city,
      totalCents: order.totalCents,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((i) => ({
        productId: i.productId,
        productNameAr: i.productNameAr,
        priceCents: i.priceCents,
        quantity: i.quantity,
        imageUrl: i.imageUrl,
        lineTotalCents: i.priceCents * i.quantity,
      })),
    },
  });
}