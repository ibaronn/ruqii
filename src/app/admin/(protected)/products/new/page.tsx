import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "إضافة منتج — لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminNewProductPage() {
  return <ProductForm />;
}