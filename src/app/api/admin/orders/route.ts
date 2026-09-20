import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../_guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const status = sp.get("status")?.trim();
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(5, Number(sp.get("pageSize") ?? "12")));

  const where: Prisma.OrderWhereInput = {
    ...(status && status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q.toUpperCase() } },
            { customerName: { contains: q } },
            { customerPhone: { contains: q } },
            { city: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            productId: true,
            productNameAr: true,
            priceCents: true,
            quantity: true,
            imageUrl: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      city: o.city,
      totalCents: o.totalCents,
      status: o.status,
      itemCount: o.items.reduce((a, i) => a + i.quantity, 0),
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        ...i,
        lineTotalCents: i.priceCents * i.quantity,
      })),
    })),
    total,
    page,
    pageSize,
  });
}