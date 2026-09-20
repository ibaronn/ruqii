import type { Metadata } from "next";
import { ProductsView } from "@/components/admin/products-view";

export const metadata: Metadata = {
  title: "المنتجات — لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return <ProductsView />;
}