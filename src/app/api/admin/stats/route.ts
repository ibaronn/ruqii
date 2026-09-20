import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAdmin, unauthorized } from "../_guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await guardAdmin();
  if (!admin) return unauthorized();

  const [
    productCount,
    activeProducts,
    orderCount,
    revenueAgg,
    lowStock,
    recentOrders,
    byStatus,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalCents: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const daysRaw = await prisma.order.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 6 * 86400000) },
      status: { not: "CANCELLED" },
    },
    select: { createdAt: true, totalCents: true },
  });

  const salesByDay: { label: string; value: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = day.toDateString();
    const rows = daysRaw.filter(
      (r) => new Date(r.createdAt).toDateString() === key
    );
    salesByDay.push({
      label: new Intl.DateTimeFormat("ar", { weekday: "short" }).format(day),
      value: rows.reduce((a, r) => a + r.totalCents, 0),
      count: rows.length,
    });
  }

  return NextResponse.json({
    products: productCount,
    activeProducts,
    orders: orderCount,
    revenueCents: revenueAgg._sum.totalCents ?? 0,
    lowStock,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
    })),
    byStatus: Object.fromEntries(
      byStatus.map((s) => [s.status, s._count._all])
    ),
    salesByDay,
  });
}