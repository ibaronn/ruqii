import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  description: "أكمل طلبك من رُقي بثلاث خطوات بسيطة.",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}