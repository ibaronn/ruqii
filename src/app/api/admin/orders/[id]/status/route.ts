import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../../../_guard";
import { ORDER_STATUSES } from "@/lib/orders";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  let body: { status?: string } = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }
  const status = body.status;
  if (
    !status ||
    !Object.prototype.hasOwnProperty.call(ORDER_STATUSES, status)
  ) {
    return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!order) throw new Error("NOT_FOUND");
      if (order.status === status) return order;
      // الطلب الملغي نهائي: المخزون أُعيد فلا يجوز إحياؤه
      if (order.status === "CANCELLED") throw new Error("LOCKED");

      // تحديث مشروط بالحالة الحالية حتى لا يُعاد المخزون مرتين عند طلبين متزامنين
      const res = await tx.order.updateMany({
        where: { id: params.id, status: order.status },
        data: { status },
      });
      if (res.count === 0) throw new Error("CONFLICT");

      if (status === "CANCELLED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      return tx.order.findUniqueOrThrow({ where: { id: params.id } });
    });

    return NextResponse.json({
      order: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND")
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (msg === "LOCKED")
      return NextResponse.json(
        { error: "لا يمكن تغيير حالة طلب ملغي" },
        { status: 409 }
      );
    if (msg === "CONFLICT")
      return NextResponse.json(
        { error: "تغيّرت حالة الطلب للتو، حدّث الصفحة وأعد المحاولة" },
        { status: 409 }
      );
    return NextResponse.json({ error: "تعذّر تحديث الحالة" }, { status: 500 });
  }
}
