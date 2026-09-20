import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { generateOrderNumber } from "@/lib/orders";
import { notifyAdminOnOrder } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`order:${ip}`, 15, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "طلبات كثيرة، حاول بعد قليل" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const { customerName, customerPhone, city, items } = parsed.data;
  const ids = [...new Set(items.map((i) => i.productId))];

  // حد لكل رقم هاتف محفوظ في قاعدة البيانات (الحد في الذاكرة لا يعمل بين نُسخ Vercel)
  const recentByPhone = await prisma.order.count({
    where: {
      customerPhone,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentByPhone >= 5) {
    return NextResponse.json(
      { error: "تم إرسال طلبات كثيرة من هذا الرقم، حاول لاحقًا أو تواصل معنا" },
      { status: 429 }
    );
  }

  const createOrder = () =>
    prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: ids } },
        include: {
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true },
          },
        },
      });

      const byId = new Map(products.map((p) => [p.id, p]));
      const orderItems = [];
      let total = 0;

      for (const line of items) {
        const product = byId.get(line.productId);
        if (!product) {
          throw new Error("UNKNOWN_PRODUCT");
        }
        if (!product.isActive) {
          throw new Error("PRODUCT_INACTIVE");
        }
        if (product.stock < line.quantity) {
          throw new Error("OUT_OF_STOCK");
        }
        total += product.priceCents * line.quantity;
        orderItems.push({
          productId: product.id,
          productNameAr: product.nameAr,
          priceCents: product.priceCents,
          quantity: line.quantity,
          imageUrl: product.images[0]?.url ?? null,
        });
      }

      const orderNumber = await generateOrderNumber(tx);

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          city,
          totalCents: total,
          status: "APPROVED",
          items: { create: orderItems },
        },
        include: { items: true },
      });

      for (const line of items) {
        const res = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (res.count === 0) {
          throw new Error("STOCK_RACE");
        }
      }

      return { orderNumber, total, order };
    });

  try {
    // رقم الطلب يُحسب من عدد طلبات اليوم؛ عند تزامن طلبين قد يتصادمان (P2002) فنعيد المحاولة برقم جديد
    let result: Awaited<ReturnType<typeof createOrder>> | undefined;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        result = await createOrder();
        break;
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code === "P2002" && attempt < 4) continue;
        throw err;
      }
    }
    if (!result) throw new Error("UNKNOWN");

    try {
      await notifyAdminOnOrder(result.order);
    } catch {
      // لا يجب أن يمنع إشعارُ الواتساب تسليمَ نجاح الطلب أبدًا
    }

    return NextResponse.json(
      {
        ok: true,
        orderNumber: result.orderNumber,
        totalCents: result.total,
        order: result.order,

      },
      { status: 201 }
    );
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "UNKNOWN";
    if (msg === "OUT_OF_STOCK") {
      return NextResponse.json(
        { error: "بعض المنتجات في السلة نفدت من المخزون، حدّث السلة ثم أعد المحاولة" },
        { status: 409 }
      );
    }
    if (msg === "PRODUCT_INACTIVE" || msg === "UNKNOWN_PRODUCT") {
      return NextResponse.json(
        { error: "بعض المنتجات في السلة لم تعد متوفرة" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "تعذّر إنشاء الطلب، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}