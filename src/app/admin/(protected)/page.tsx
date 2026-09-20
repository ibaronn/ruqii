import type { Metadata } from "next";
import { DashboardView } from "@/components/admin/dashboard-view";

export const metadata: Metadata = {
  title: "نظرة عامة — لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <DashboardView />;
}