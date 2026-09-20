import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { ImageManager } from "@/components/admin/image-manager";

export const metadata: Metadata = {
  title: "تعديل منتج — لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminEditProductPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-10">
      <ProductForm productId={params.id} />
      <div className="mx-auto max-w-2xl">
        <div className="glass p-6">
          <ImageManager productId={params.id} />
        </div>
      </div>
    </div>
  );
}