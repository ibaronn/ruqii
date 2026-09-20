import type { Metadata } from "next";
import { OrdersView } from "@/components/admin/orders-view";

export const metadata: Metadata = {
  title: "الطلبات — لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return <OrdersView />;
}