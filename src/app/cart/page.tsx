import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";

export const metadata: Metadata = {
  title: "سلة التسوق",
  description: "مراجعة سلة التسوق وإتمام طلبك.",
};

export default function CartPage() {
  return <CartView />;
}