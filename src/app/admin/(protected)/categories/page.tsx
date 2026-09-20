import type { Metadata } from "next";
import { CategoriesView } from "@/components/admin/categories-view";

export const metadata: Metadata = {
  title: "التصنيفات — لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return <CategoriesView />;
}