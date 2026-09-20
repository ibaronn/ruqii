import type { Prisma, PrismaClient } from "@prisma/client";

export const ORDER_STATUSES = {
  APPROVED: "APPROVED",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

export const STATUS_LABELS: Record<OrderStatus, string> = {
  APPROVED: "تمت الموافقة على الطلب",
  SHIPPING: "قيد الشحن",
  DELIVERED: "تم التوصيل",
};

export const STATUS_STEPS: OrderStatus[] = ["APPROVED", "SHIPPING", "DELIVERED"];

export function statusStepIndex(status: string) {
  return Math.max(0, STATUS_STEPS.indexOf(status as OrderStatus));
}

export function pad(n: number, size = 3) {
  return String(n).padStart(size, "0");
}

type OrderCountClient = {
  order: {
    count: (args: {
      where?: Prisma.OrderWhereInput;
    }) => Promise<number>;
  };
};

export async function generateOrderNumber(client: OrderCountClient) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const prefix = `RQI-${y}${m}${d}-`;
  const count = await client.order.count({
    where: { orderNumber: { startsWith: prefix } },
  });
  return `${prefix}${pad(count + 1)}`;
}