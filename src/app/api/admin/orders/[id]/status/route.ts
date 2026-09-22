import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../../../_guard";
import { ORDER_STATUSES } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  let body: { status?: string } = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }
  const status = body.status;
  if (!status || !(status in ORDER_STATUSES)) {
    return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({
    order: {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { orderId: params.id } }),
    prisma.order.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ ok: true });
}