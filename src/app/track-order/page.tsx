import type { Metadata } from "next";
import { TrackOrderView } from "@/components/store/track-order-view";

export const metadata: Metadata = {
  title: "تتبع الطلب",
  description: "تابع حالة طلبك من رُقي باستخدام رقم الطلب ورقم الهاتف.",
};

export default function TrackOrderPage() {
  return <TrackOrderView />;
}